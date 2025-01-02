import { OurServices } from "./OurServices";

export function Body() {
    return <div className="flex flex-col mt-16 items-center relative">
        <div className="flex flex-col justify-between flex-1 items-center h-full w-full border bg-[#EFEFEF] relative min-h-screen rounded-[42px] absolute left-0 right-0">
            {/* Card Row */}
            <div className="flex justify-between gap-4 p-[40px] bg-[#0F1012] rounded-[24px]w-screen h-[283px] left-[100px] right-[100px] top-[-80px] flex-wrap absolute rounded-[24px]">
                Card
                <div className="flex-1 w-[200px] h-[202px] bg-[#2D3BFF] rounded-[16px] p-[16px] text-white">
                    <div className="flex p-2">
                        <div className="flex-[8]">
                            <h5 className="font-[700] text-[48px] leading-[65px]">10k +</h5>
                            <p className="text-[16px] font-[400px] leading-[24px]">Satisfied customers</p>
                        </div>
                        <div className="flex-[4]">
                            <div className="size-[70px] rounded-[35px] bg-white flex items-center justify-center">
                                <div className="size-[24px] rounded-[12px] bg-[#1E1E1E]"></div>
                            </div>
                        </div>
                    </div>
                    <div className="text-[12px] font-[300] leading-[18px]">Fast, secure, and reliable services trusted by customers worldwide.</div>
                </div>
                {/* Card */}
                <div className="flex-1 h-[202px] bg-[#FFFFFF] rounded-[16px] p-[16px] flex flex-col justify-center gap-4 items-center">
                    <span className="font-[700] text-[48px] leading-[65px]">99%</span>
                    <p className="text-[16px] font-[400px] leading-[24px]">Uptime Guarantee</p>
                </div>

                {/* Card */}
                <div className="flex-1 h-[202px] bg-[#FFFFFF] rounded-[16px] p-[16px] flex flex-col justify-center gap-4 items-center">
                    <span className="font-[700] text-[48px] leading-[65px]">100k</span>
                    <p className="text-[16px] font-[400px] leading-[24px]">Airtime Top Ups Monthly</p>
                </div>

                {/* Card */}
                <div className="flex-1 h-[202px] bg-[#FFFFFF] rounded-[16px] p-[16px] flex flex-col justify-center gap-4 items-center">
                    <span className="font-[700] text-[48px] leading-[65px]">1m+</span>
                    <p className="text-[16px] font-[400px] leading-[24px]">Transactions Processed</p>
                </div>
            </div>

            <OurServices />
        </div>

        <section>
            <h3 className="text-[#13196B] mt-[200px] text-[48px] font-[700] leading-[65.57px] text-center">Why Choose ICM tech?</h3>
            <p className="text-center">Trusted by thousands for seamless transactions and reliable service.</p>

            {/* Card Row */}
            <div className="flex justify-between gap-4 p-[40px] rounded-[24px] h-[283px] flex-wrap rounded-[24px]">
                {/* Card */}
                <div className="flex-1 w-[286px] h-[274px] shadow-sm border rounded-[16px] p-[16px]">
                    <img src="/landing/data.png" alt="" />
                    <h6 className="text-[24px] font-[700] leading-[33.6px]">Fast and Secured</h6>
                    <p className="text-[16px] font-[400] leading-[24px] text-[#616161]">Experience fast, and reliable payments with multiple options at your fingertips.</p>
                </div>
                {/* Card */}
                <div className="flex-1 w-[286px] h-[274px] bg-[#FFFFFF]  shadow-sm border rounded-[16px] p-[16px]">
                    <img src="/landing/data.png" alt="" />
                    <h6 className="text-[24px] font-[700] leading-[33.6px]">Wide Range of Services</h6>
                    <p className="text-[16px] font-[400] leading-[24px] text-[#616161]">Access everything from Airtime & Data to Airline Bookings and Gift Cards in one platform.</p>
                </div>
                {/* Card */}
                <div className="w-[286px] h-[274px] bg-[#FFFFFF]  shadow-sm border rounded-[16px] p-[16px]">
                    <img src="/landing/data.png" alt="" />
                    <h6 className="text-[24px] font-[700] leading-[33.6px]">Instant Confirmations</h6>
                    <p className="text-[16px] font-[400] leading-[24px] text-[#616161]">Get instant confirmations for every transaction, ensuring you're always in control.</p>
                </div>
                {/* Card */}
                <div className="w-[286px] h-[274px] bg-[#FFFFFF] shadow-sm border rounded-[16px] p-[16px]">
                    <img src="/landing/data.png" alt="" />
                    <h6 className="text-[24px] font-[700] leading-[33.6px]">247 Support</h6>
                    <p className="text-[16px] font-[400] leading-[24px] text-[#616161]">Our dedicated support team is available 24/7 to assist you whenever you need help.</p>
                </div>
            </div>

        </section>

        {/* How it works */}
        <section className="bg-[#EFEFEF] z-[12] w-full rounded-[42px] flex flex-col items-center p-4 min-h-screen mt-[180px] relative">
            <img className="absolute left-0" src="/landing/letter_send 1.png" alt="" />
            <img className="absolute right-0" src="/landing/letter_send 2.png" alt="" />
            <h3 className="text-[#13196B] text-[48px] font-[700] leading-[65.57px] text-center">How it works</h3>
            <p>Get started with ICM Tech in just a few simple steps.</p>
            <div className="flex w-full">
                <div className="flex-1 flex flex-col gap-4 border-l border-dashed p-4">
                    <div>1</div>
                    <div>2</div>
                </div>
                <div className="flex-1 flex flex-col gap-4 border-l border-dashed p-4">
                    <div>3</div>
                    <div>4</div>
                </div>
            </div>
        </section>

        <div className="relative w-full flex justify-center mt-[-295px]">
            <img src="/landing/abstract-bg-2.png" className="absolute top-[-0px] left-0 " alt="" />
            <section className="h-[590px] p-4 bg-[#13196B] rounded-[32px] absolute z-[100] w-[930px] text-white flex">

                <div className="flex-1 flex flex-col gap-4 justify-center">
                    <h3 className="text-[48px] font-[700] leading-[72px] max-w-[530px]">Join the ICM Tech Community Today!</h3>
                    <p className="text-[16px] font-[400]">Enjoy fast, secure, and convenient services for all your digital needs.</p>
                    <div>
                    <button className="p-4 bg-[#EFEFEF] text-black flex items-center gap-2 rounded-[4px]">Get Started

<img src="/landing/cta-go-black.png" alt="" />
</button>
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                    <img className="mb-[-16px]" src="/landing/join.png" alt="" />
                </div>
            </section>


        </div>

        {/* What our customers are saying */}
        <section className="relative mt-[800px] h-[550px] overflow-hidden">

            <h3 className="text-[#13196B] text-[48px] font-[700] leading-[65.57px] text-center">What our customers are saying</h3>
            <p className="text-center">Thousands of satisfied customers trust ICM Tech for their digital service needs.</p>

            {/* Testimonial Slider */}
            <div className="h-[366px] mt-[70px] relative z-[10] flex justify-around items-center">
                <img src="/landing/arrow-left.png" alt="" />
                {/* Testimonial 1 */}
                <div className="w-[469px] h-[366px] flex flex-col items-center">
                    <div className="flex gap-4">
                        <img className="w-[27px] h-[27px]" src="/landing/star-gold.png" alt="" />
                        <img src="/landing/star-gold.png" alt="" />
                        <img src="/landing/star-gold.png" alt="" />
                        <img src="/landing/star-gold.png" alt="" />
                        <img src="/landing/star-gold.png" alt="" />
                    </div>
                    <p>"ICM Tech is the most convenient platform for my airtime and cable subscriptions. The process is always seamless!"</p>
                    <div className="overflow-hidden flex items-center justify-center size-[50px]">
                        <img src="/landing/testimonial-avatar.png" alt="" />
                    </div>
                    <p>David Okeke, Lagos, Nigeria</p>
                </div>
                {/* Testimonial 1 */}
                <div className="w-[469px] h-[366px] flex flex-col items-center">
                    <div className="flex gap-4">
                        <img className="w-[27px] h-[27px]" src="/landing/star-gold.png" alt="" />
                        <img src="/landing/star-gold.png" alt="" />
                        <img src="/landing/star-gold.png" alt="" />
                        <img src="/landing/star-gold.png" alt="" />
                        <img src="/landing/star-gold.png" alt="" />
                    </div>
                    <p>"ICM Tech is the most convenient platform for my airtime and cable subscriptions. The process is always seamless!"</p>

                    <div className="overflow-hidden flex items-center justify-center size-[50px]">
                        <img src="/landing/testimonial-avatar.png" alt="" />
                    </div>
                    <p>David Okeke, Lagos, Nigeria</p>
                </div>
                <img src="/landing/arrow-right.png" alt="" />
            </div>


        </section>
    </div>;
}
