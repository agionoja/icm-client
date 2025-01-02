import { OurServices } from "./OurServices";


export function Body() {
    return <div className="flex flex-col mt-16 items-center relative">
        <div className="flex flex-col justify-between flex-1 items-center h-full w-full border bg-[#EFEFEF] relative min-h-screen rounded-[42px] absolute left-0 right-0">
            <OurServices />
        </div>

        <section className="flex flex-col gap-4 justify-center items-center">
            <h3 className="text-[#13196B] text-[48px] font-[700] leading-[65.57px] text-center">What ICM Tech Offers</h3>
            <p className="text-center w-[654px]">We prioritize customer-first support by ensuring fast, secure, and reliable service at every step, with help available whenever you need it.</p>

            <div className="flex">
                <div className="w-[647px] h-[645px] relative">
                    <div className="relative w-[529px] h-[645px] overflow-hidden flex items-center justify-center" >
                        <img className="" src="/about/woman-image.png" alt="" />
                    </div>
                    <div className="absolute right-0 top-[200px] bg-[#13196BE5] h-[176px] w-[327px] p-4 text-white rounded-tr-[20px] rounded-bl-[20px]">
                        Your satisfaction is our priority. We are always here to help, ensuring every interaction is smooth and efficient.
                    </div>
                </div>

                <div className="flex-1 p-[40px]">
                    <h4>Our Services</h4>
                    {/* Card Row */}
                    <div className="flex gap-4 pt-[40px] [283px] flex-wrap rounded-[24px]">
                        {/* Card */}

                        <div className="w-[178px] h-[173px] bg-[#E9EBF84D] shadow-sm border rounded-[16px] p-[16px]">
                            <img src="/landing/airtime.png" alt="" />
                            <p>Airtime Recharge</p>
                        </div>
                        {/* Card */}
                        <div className="w-[178px] h-[173px] bg-[#E9EBF84D]  shadow-sm border rounded-[16px] p-[16px]">
                            <p>Data Recharge</p>
                        </div>
                        {/* Card */}
                        <div className="w-[178px] h-[173px] bg-[#E9EBF84D]  shadow-sm border rounded-[16px] p-[16px]">
                            <p>Cable Subscription</p>
                        </div>
                        {/* Card */}
                        <div className="w-[178px] h-[173px] bg-[#E9EBF84D] shadow-sm border rounded-[16px] p-[16px]">
                            <p>Airline Booking</p>
                        </div>
                        {/* Card */}
                        <div className="w-[178px] h-[173px] bg-[#E9EBF84D] shadow-sm border rounded-[16px] p-[16px]">
                            <p>Gift Card Purchase</p>
                        </div>
                        {/* Card */}
                        <div className="w-[178px] h-[173px] bg-[#E9EBF84D] shadow-sm border rounded-[16px] p-[16px]">
                            <p>Crypto</p>
                        </div>
                    </div>
                    <button className="mt-8 p-8 bg-blue-900 rounded-[16px] text-white">Get Started</button>
                </div>
            </div>

        </section>


        <section className="flex flex-col gap-4 justify-center items-center mb-[350px] pt-12">
            <h3 className="text-[#13196B] text-[48px] font-[700] leading-[65.57px] text-center max-w-[654px]">ICM Tech Core Values: The Foundation of our Success</h3>
           <div className="flex">
                <div className="flex-1 p-[40px] pt-0">
                    <h4> </h4>
                    {/* Card Row */}
                    <div className="flex gap-4 pt-[40px] [283px] flex-wrap rounded-[24px]">
                        {/* Card */}

                        <div className="w-[287px] h-[301px] bg-[#ECF0FC80] shadow-sm border rounded-[16px] p-[16px]">
                            <img src="/landing/airtime.png" alt="" />
                            <p>Airtime Recharge</p>
                        </div>
                        {/* Card */}
                        <div className="w-[287px] h-[301px] bg-[#ECF0FC80]  shadow-sm border rounded-[16px] p-[16px]">
                            <p>Data Recharge</p>
                        </div>
                        {/* Card */}
                        <div className="w-[287px] h-[301px] bg-[#ECF0FC80]  shadow-sm border rounded-[16px] p-[16px]">
                            <p>Cable Subscription</p>
                        </div>
                        {/* Card */}
                        <div className="w-[287px] h-[301px] bg-[#ECF0FC80] shadow-sm border rounded-[16px] p-[16px]">
                            <p>Airline Booking</p>
                        </div>
                       
                    </div>
                </div>
            </div>

        </section>
    </div>;
}
