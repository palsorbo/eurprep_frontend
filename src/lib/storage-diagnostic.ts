// Storage Diagnostic Script
// Run this to identify storage upload issues

import { supabase } from './supabase'
import { uploadToStorage } from './storage'

export async function diagnoseStorageIssues() {
    console.log('🔍 Starting storage diagnosis...')

    const issues: string[] = []
    const fixes: string[] = []

    try {
        // 1. Check authentication
        console.log('\n1. Checking authentication...')
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
            issues.push('Authentication error: ' + authError.message)
            fixes.push('Check if user is properly logged in')
        } else if (!user) {
            issues.push('User not authenticated')
            fixes.push('User needs to be logged in to upload files')
        } else {
            console.log('✅ User authenticated:', user.id)
        }

        // 2. Check storage bucket
        console.log('\n2. Checking storage bucket...')

        // 2.1 Check if bucket exists
        console.log('\n2.1 Checking if bucket exists...')
        const { data: buckets } = await supabase.storage.listBuckets()
        const jamBucket = buckets?.find(b => b.name === 'jam-recordings')
        if (jamBucket) {
            console.log('✅ Bucket found:', jamBucket.name)
        } else {
            issues.push('Storage bucket does not exist')
            fixes.push('Create jam-recordings bucket in Supabase dashboard')
        }

        // 3. Test upload
        console.log('\n3. Testing upload...')
        const testBlob = new Blob(['test audio content'], { type: 'audio/wav' })
        const uploadResult = await uploadToStorage('test/diagnostic.wav', testBlob)

        if (uploadResult.error) {
            issues.push('Upload failed: ' + uploadResult.error)

            if (uploadResult.error.includes('row-level security policy')) {
                fixes.push('Disable RLS on jam-recordings storage bucket')
            } else if (uploadResult.error.includes('Bucket does not exist')) {
                fixes.push('Create jam-recordings bucket in Supabase dashboard')
            } else if (uploadResult.error.includes('Permission denied')) {
                fixes.push('Check user permissions and authentication')
            }
        } else {
            console.log('✅ Upload test successful:', uploadResult.path)
        }

        // 4. Check bucket settings
        console.log('\n4. Checking bucket settings...')
        try {
            const { data: buckets, error: listError } = await supabase.storage.listBuckets()

            if (listError) {
                issues.push('Cannot list buckets: ' + listError.message)
            } else {
                const jamBucket = buckets?.find(b => b.name === 'jam-recordings')
                if (jamBucket) {
                    console.log('✅ Bucket found:', jamBucket.name)
                    console.log('   Public:', jamBucket.public)
                    console.log('   File size limit:', jamBucket.file_size_limit)
                }
            }
        } catch {
            issues.push('Cannot access bucket settings')
        }

    } catch (error) {
        issues.push('Diagnosis failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }

    // Summary
    console.log('\n📋 DIAGNOSIS SUMMARY')
    console.log('=====================')

    if (issues.length === 0) {
        console.log('✅ No issues found! Storage should be working properly.')
    } else {
        console.log('❌ Issues found:')
        issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`)
        })

        console.log('\n🔧 Suggested fixes:')
        fixes.forEach((fix, index) => {
            console.log(`   ${index + 1}. ${fix}`)
        })
    }

    return {
        issues,
        fixes,
        success: issues.length === 0
    }
}

// Quick test function
export async function quickStorageTest() {
    console.log('🧪 Running quick storage test...')

    const testBlob = new Blob(['test'], { type: 'audio/wav' })
    const result = await uploadToStorage('quick-test.wav', testBlob)

    if (result.error) {
        console.error('❌ Quick test failed:', result.error)
        return false
    } else {
        console.log('✅ Quick test passed:', result.path)
        return true
    }
}

// Usage examples:
// import { diagnoseStorageIssues, quickStorageTest } from './storage-diagnostic'
// 
// // Run full diagnosis
// await diagnoseStorageIssues()
// 
// // Run quick test
// await quickStorageTest() 