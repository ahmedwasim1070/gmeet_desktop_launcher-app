// Imports
import React, { useState } from "react"
import { CalendarDays, Headset, ShieldCheck, Wallpaper, X } from "lucide-react"

// Interface
interface Props {
    setIsPaymentPop: React.Dispatch<React.SetStateAction<boolean>>;
}

// 
function PaymentPop({ setIsPaymentPop }: Props) {
    // States
    // Selected Plan
    const [selectedPlan, setSelectedPlan] = useState<number>(0);
    // Featured 
    const featured = [
        {
            label: 'Virtual Background',
            icon: <Wallpaper size={20} />
        },
        {
            label: 'Schedule Meetings',
            icon: <CalendarDays size={20} />
        },
        {
            label: 'Ad-Free Experience',
            icon: <svg width={22} height={22} className=" fill-white" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 407.96"><path fillRule="nonzero" d="M74.36 0h295.21c40.84 0 74.37 33.52 74.37 74.36v146.3c-9.49-5.1-19.01-10.13-28.35-14.93V74.36c0-25.32-20.69-46.02-46.02-46.02H74.36c-25.34 0-46.02 20.68-46.02 46.02v169.07c0 25.27 20.76 46.01 46.02 46.01h240.72l4.55 28.35H74.36C33.46 317.79 0 284.33 0 243.43V74.36C0 33.51 33.51 0 74.36 0zM460.8 406.23c-5.6 3.19-12.89 1.91-16.8-3.38l-28.14-38.81-19.56 27.06c-1.61 2.22-3.37 4.22-5.2 5.88-11.66 10.7-26.11 7.98-29.12-9.25l-25.01-166.24c-1.59-7.56 6.08-13.54 13.1-10.47 41.84 16.73 107.81 52.79 151 76.3 20.73 11.36 8.43 28.53-7.57 33.59-9.71 3.71-21.78 6.88-31.9 10.07l28.07 39.08c3.84 5.52 2.52 13.21-2.7 17.36-7.55 5.36-18.61 14.72-26.17 18.81zm-6.17-13.11L477 376.97c-7.25-9.92-31.76-39.89-35.15-48.82-1.19-3.75.94-7.79 4.69-8.96 13.6-4.19 27.8-7.94 41.53-11.83 3.16-1.01 5.95-2.36 8.11-4.94-1.09-1.1-1.74-1.62-3.14-2.38l-138.81-70.13 22.94 153.4c.08.44.91 3.8 1.1 4.03 3.36-2 5.02-3.25 7.41-6.55 4.87-7.26 19.14-31.77 24.72-35.97 3.19-2.19 7.6-1.46 9.88 1.68l34.35 46.62zM232.67 215.38V102.41h50.61c20.36 0 34.34 4.34 41.93 13.02 7.59 8.67 11.39 23.17 11.39 43.47 0 20.3-3.8 34.79-11.39 43.46-7.59 8.68-21.57 13.02-41.93 13.02h-50.61zm51.15-84.04h-15v55.12h15c4.94 0 8.53-.58 10.75-1.72 2.23-1.14 3.35-3.77 3.35-7.86v-35.97c0-4.09-1.12-6.71-3.35-7.86-2.22-1.14-5.81-1.71-10.75-1.71zm-138.35 84.04h-38.14l29.28-112.97h55.85l29.28 112.97H183.6l-4.15-17.9h-29.83l-4.15 17.9zm18.07-78.26-7.41 31.63h16.63l-7.23-31.63h-1.99z" /></svg>
        },
        {
            label: '24/7 Pirority Support',
            icon: <Headset size={20} />
        },
    ]
    // Plans
    const plans = [
        {
            idx: 0,
            label: 'Anual Plan',
            planCode: 'anual',
            slogen: 'Onece In a Year',
            price: '5.00 $',

        },
        {
            idx: 1,
            label: 'LifeTime Plan',
            planCode: 'lifeTime',
            slogen: 'One Time Only',
            price: '20.00 $',
        },
    ]
    // Support Link
    const navItems = [
        {
            label: 'Terms of Service | ',
        },
        {
            label: 'Support | ',
        },
        {
            label: 'Privacy Policy',
        },

    ]

    // Handle click
    const handlePlanChange = (e: React.MouseEvent<HTMLButtonElement>) => {
        const value = e.currentTarget.dataset.value;
        if (value === 'anual' || value === "lifeTime") {
            const plan = plans.find((plan) => plan.planCode === value);
            if (plan) {
                setSelectedPlan(plan.idx);
            }
        }
    };

    return (
        <section className="min-w-screen min-h-screen bg-gray-900/40 backdrop-blur-sm fixed z-50 inset-0 flex items-center justify-center">
            {/*  */}
            <div className="bg-white max-h-[98%] rounded-lg relative overflow-y-scroll">
                {/* Cross btn */}
                <button onClick={() => setIsPaymentPop(false)} className="p-2 bg-gray-200 rounded-full absolute right-3 top-3 cursor-pointer hover:bg-gray-300 active:bg-gray-400 transition-colors">
                    <X className="w-6 h-6 text-gray-500" />
                </button>

                <div className="flex flex-col items-center justify-center text-center px-7 py-4 gap-y-2">
                    {/*  */}
                    <p>Unlock <strong className="text-blue-500">Premium</strong> Features</p>

                    {/*  */}
                    <div className="flex flex-row my-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><rect width="16" height="16" x="12" y="16" fill="#fff" transform="rotate(-90 20 24)" /><polygon fill="#1e88e5" points="3,17 3,31 8,32 13,31 13,17 8,16" /><path fill="#4caf50" d="M37,24v14c0,1.657-1.343,3-3,3H13l-1-5l1-5h14v-7l5-1L37,24z" /><path fill="#fbc02d" d="M37,10v14H27v-7H13l-1-5l1-5h21C35.657,7,37,8.343,37,10z" /><path fill="#1565c0" d="M13,31v10H6c-1.657,0-3-1.343-3-3v-7H13z" /><polygon fill="#e53935" points="13,7 13,17 3,17" /><polygon fill="#2e7d32" points="38,24 37,32.45 27,24 37,15.55" /><path fill="#4caf50" d="M46,10.11v27.78c0,0.84-0.98,1.31-1.63,0.78L37,32.45v-16.9l7.37-6.22C45.02,8.8,46,9.27,46,10.11z" /></svg>
                        <h1 className="max-w-90 text-2xl font-bold text-center">Join Google Meetings With Ease.</h1>
                    </div>

                    {/* Features showroom */}
                    <div className=" w-full grid grid-cols-2 gap-x-4 gap-y-2 my-4">
                        {featured.map((item, idx) => (
                            <div key={idx} className="w-full bg-blue-100 rounded-lg flex flex-row items-center p-2 gap-x-4">
                                <span className="p-2 rounded-lg text-white bg-blue-600">
                                    {item.icon}
                                </span>
                                <p className="font-semibold">{item.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Plans Showroom */}
                    <div className="w-full">
                        {plans.map((plan, idx) => (
                            <button
                                data-value={plan.planCode}
                                onClick={handlePlanChange}
                                key={idx}
                                className={`w-full bg-blue-50 flex flex-row justify-between items-center p-4 rounded-lg border-2 border-blue-50  transition-colors ${plan.idx === selectedPlan ? 'bg-blue-200 border-blue-600 ' : 'hover:bg-blue-100 active:bg-blue-200 cursor-pointer '}`}
                            >
                                {/* Left */}
                                <div className="flex flex-col text-left">
                                    <p className="text-lg font-semibold text-blue-500">{plan.label}</p>
                                    <p className="text-sm font-semibold">{plan.slogen}</p>
                                </div>
                                {/* Right */}
                                <div className="flex flex-col text-right">
                                    <p className="text-2xl font-bold">{plan.price}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Payment Info */}
                    <div className="flex flex-row items-center">
                        <ShieldCheck className="fill-blue-600 text-white" />
                        <p className="text-sm">Secure Payment via Micorosoft.</p>
                    </div>

                    {/* Submit */}
                    <button className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white w-full py-3 rounded-lg text-lg font-semibold cursor-pointer">
                        <p>Continue</p>
                    </button>

                    {/*  */}
                    <p className="max-w-90 text-[12px] text-gray-500">Subscription will get auto-renewed if not disabled from Microsoft store or account.</p>

                    {/*  */}
                    <ul className="flex flex-row items-center gap-x-2">
                        {navItems.map((nav, idx) => (
                            <li key={idx} className="text-sm text-gray-600 cursor-pointer group">
                                <a className="group-hover:underline" href="">{nav.label}</a>
                            </li>
                        ))}
                    </ul>

                </div>
            </div>
        </section>
    )
}

export default PaymentPop