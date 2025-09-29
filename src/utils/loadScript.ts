/**
 * Utility function to dynamically load external scripts
 * @param src - The script source URL
 * @param id - Unique identifier for the script (to prevent duplicate loading)
 * @returns Promise that resolves when script is loaded
 */
export const loadScript = (src: string, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (document.getElementById(id)) {
            resolve()
            return
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector(`script[src="${src}"]`)
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve())
            existingScript.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)))
            return
        }

        const script = document.createElement('script')
        script.id = id
        script.src = src
        script.async = true

        script.onload = () => {
            resolve()
        }

        script.onerror = () => {
            reject(new Error(`Failed to load script: ${src}`))
        }

        document.head.appendChild(script)
    })
}

/**
 * Load Razorpay checkout script dynamically
 * @returns Promise that resolves when Razorpay is available on window object
 */
export const loadRazorpayScript = (): Promise<void> => {
    return loadScript('https://checkout.razorpay.com/v1/checkout.js', 'razorpay-checkout-script')
        .then(() => {
            // Wait for Razorpay to be available on window object
            return new Promise<void>((resolve) => {
                const checkRazorpay = () => {
                    if (window.Razorpay) {
                        resolve()
                    } else {
                        setTimeout(checkRazorpay, 100)
                    }
                }
                checkRazorpay()
            })
        })
}
