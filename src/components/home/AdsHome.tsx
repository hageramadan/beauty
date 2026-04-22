import React from 'react'
import { Button } from '../ui/button'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'
import Image from 'next/image'

export  function AdsHome() {
  return (
     <section className="py-6 md:py-12  bg-white">
        <div className="container  bg-[#F2F8FD] rounded-2xl flex  items-center justify-between md:justify-evenly px-2 md:px-10 py-8">
          <div className='flex flex-col gap-1 md:gap-[22px]'>
              <p className='text-[10px] md:text-[14px] text-semibold py-1 px-2 bg-[#FF995D] text-white w-fit '>وفر اكثر منEGP 5000.00</p>
            <h1 className='text-xl md:text-[48px] text-[#191C1F]'>Macbook Pro</h1>
            <p className='text-sm md:text-[24px] text-[#191C1F] w-full md:w-[80%] leading-[1.5]'>Apple M1 Max Chip. 32GB Unified Memory, 1TB SSD Storage</p>
              <Button
                asChild
                aria-label='buy now'
                className="w-fit md:w-[180px] md:h-[60px] animate-in text-[12px] md:text-[16px] font-bold fade-in slide-in-from-bottom-5 duration-700 delay-200 rounded-xl"
                style={{ 
                    backgroundColor: '#23A6F0',
                   
                }}
                >
                <Link href="#" className="flex items-center justify-center gap-2 text-white">
                   تسوق الان
                    <FaArrowLeft  className="h-4 w-4" />
                </Link>
                </Button>
          </div>
          <div>
            <Image src="/images/ads.png" alt="Advertisement" className='w-[336px] md:w-[536px] h-[124px] md:h-[424px]' width={500} height={300} />
          </div>
        </div>
     </section>
  )
}
