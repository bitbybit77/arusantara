import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Buat Akun" />

            <div>
                <h1 className="text-[32px] font-semibold leading-none tracking-[-0.045em] text-[#18201d]">
                    Buat akun
                </h1>
                <p className="mt-2.5 max-w-[360px] text-[11px] leading-5 text-[#6f7773]">
                    Simpan configuration, calculation, dan technical baseline dalam satu akun.
                </p>

                <Form
                    {...store.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="mt-5 flex flex-col gap-3.5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-3">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="name" className="text-[10px]">
                                        Nama
                                    </Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Nama lengkap"
                                        className="h-[42px] rounded-lg border-[#d9d5cc] bg-white text-[12px]"
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="text-[10px]"
                                    />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="email" className="text-[10px]">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="nama@perusahaan.com"
                                        className="h-[42px] rounded-lg border-[#d9d5cc] bg-white text-[12px]"
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="text-[10px]"
                                    />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="password" className="text-[10px]">
                                        Password
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Password"
                                        passwordrules={passwordRules}
                                        className="h-[42px] rounded-lg border-[#d9d5cc] bg-white text-[12px]"
                                    />
                                    <InputError
                                        message={errors.password}
                                        className="text-[10px]"
                                    />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label
                                        htmlFor="password_confirmation"
                                        className="text-[10px]"
                                    >
                                        Konfirmasi password
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Ulangi password"
                                        passwordrules={passwordRules}
                                        className="h-[42px] rounded-lg border-[#d9d5cc] bg-white text-[12px]"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                        className="text-[10px]"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-1 h-[43px] w-full rounded-lg bg-[#153f32] text-[12px] text-white hover:bg-[#10271f]"
                                    tabIndex={5}
                                    data-test="register-user-button"
                                >
                                    {processing && <Spinner />}
                                    Buat akun
                                </Button>
                            </div>

                            <div className="text-center text-[10px] text-muted-foreground">
                                Sudah punya akun?{' '}
                                <TextLink href={login()} tabIndex={6}>
                                    Masuk
                                </TextLink>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
