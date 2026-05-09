import { Head, useForm } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

export default function OtpVerify({ email }) {
    const { data, setData, post, processing, errors } = useForm({
        otp: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('otp.verify.submit'));
    };

    const handleResend = () => {
        post(route('otp.resend'));
    };

    return (
        <>
            <Head title="Verify OTP" />
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Verify OTP</h1>
                        <p className="text-gray-600 mt-2">Enter the 6-digit code sent to your email</p>
                        {email && <p className="text-sm text-gray-500 mt-1">OTP sent to: {email}</p>}
                    </div>

                    <form onSubmit={submit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">OTP Code</label>
                                <input
                                    type="text"
                                    value={data.otp}
                                    onChange={(e) => setData('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-center text-2xl tracking-widest"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                                {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {processing ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleResend}
                            disabled={processing}
                            className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                        >
                            Resend OTP
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <Link href="/" className="text-sm text-gray-600 hover:text-gray-800">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
