import { NextRequest, NextResponse } from 'next/server';

// Helper to properly format the private key
function formatPrivateKey(key: string): string {
  // If the key already has the right format (with newlines), return it as is
  if (key.includes('-----BEGIN PRIVATE KEY-----\n')) {
    return key;
  }
  
  // Remove any existing header/footer to start clean
  let formattedKey = key
    .replace(/\\n/g, '\n')
    .replace(/\n/g, '\n')
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .trim();
  
  // Strip any non-base64 characters
  formattedKey = formattedKey.replace(/[^a-zA-Z0-9+/=]/g, '');
  
  // Add header and footer with proper newlines
  formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----\n`;
  
  return formattedKey;
}

export async function GET(request: NextRequest) {
  try {
    // Get the current private key
    const privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    
    // Format it
    const formattedKey = formatPrivateKey(privateKey);
    
    // Create logging info
    const keyInfo = {
      originalKey: {
        length: privateKey.length,
        startsWithHeader: privateKey.startsWith('-----BEGIN PRIVATE KEY-----'),
        endsWithFooter: privateKey.endsWith('-----END PRIVATE KEY-----'),
        includesNewlines: privateKey.includes('\n'),
        includesEscapedNewlines: privateKey.includes('\\n'),
      },
      formattedKey: {
        length: formattedKey.length,
        startsWithHeader: formattedKey.startsWith('-----BEGIN PRIVATE KEY-----'),
        endsWithFooter: formattedKey.endsWith('-----END PRIVATE KEY-----'),
        includesNewlines: formattedKey.includes('\n'),
      }
    };
    
    console.log('Private key info:', keyInfo);
    
    // Try to validate the key directly
    try {
      // Dynamic import for Node.js crypto module
      // Note: This will only work in a Node.js environment
      const nodeCrypto = require('crypto') as typeof import('crypto');
      
      nodeCrypto.createPublicKey({
        key: Buffer.from(formattedKey),
        format: 'pem'
      });
      console.log('✅ Private key successfully parsed with crypto!');
      
      return NextResponse.json({
        success: true,
        message: 'Private key format is valid',
        keyInfo
      });
    } catch (error: any) {
      console.error('❌ Private key validation failed:', error.message);
      
      // Try one more format as a last resort
      try {
        const alternateKey = privateKey.replace(/\\n/g, '\n');
        const nodeCrypto = require('crypto') as typeof import('crypto');
        
        nodeCrypto.createPublicKey({
          key: Buffer.from(alternateKey),
          format: 'pem'
        });
        console.log('✅ Alternate private key successfully parsed with crypto!');
        
        return NextResponse.json({
          success: true,
          message: 'Alternate private key format is valid',
          keyInfo: {
            ...keyInfo,
            alternateKey: {
              length: alternateKey.length,
              startsWithHeader: alternateKey.startsWith('-----BEGIN PRIVATE KEY-----'),
              endsWithFooter: alternateKey.endsWith('-----END PRIVATE KEY-----'),
              includesNewlines: alternateKey.includes('\n'),
            }
          }
        });
      } catch (altError: any) {
        return NextResponse.json({
          success: false,
          message: 'Failed to validate any key format',
          error: error.message,
          alternateError: altError.message,
          keyInfo
        }, { status: 500 });
      }
    }
  } catch (error: any) {
    console.error('Error in fix-private-key endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error checking private key',
      error: error.message
    }, { status: 500 });
  }
} 