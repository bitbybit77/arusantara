<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Identity\UserRole;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        if (! $this->isConfigured()) {
            return redirect()
                ->route('login')
                ->with('status', 'Google Sign-In belum dikonfigurasi. Periksa GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, dan GOOGLE_REDIRECT_URI.');
        }

        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        if (! $this->isConfigured()) {
            return redirect()
                ->route('login')
                ->with('status', 'Google Sign-In belum dikonfigurasi.');
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable) {
            return redirect()
                ->route('login')
                ->with('status', 'Login Google gagal atau dibatalkan. Silakan coba lagi.');
        }

        $email = $googleUser->getEmail();
        $name = $googleUser->getName();

        if (! is_string($email) || trim($email) === '') {
            return redirect()
                ->route('login')
                ->with('status', 'Akun Google tidak memberikan alamat email yang dapat digunakan.');
        }

        $verified = (bool) (
            $googleUser->user['email_verified']
            ?? $googleUser->user['verified_email']
            ?? false
        );

        if (! $verified) {
            return redirect()
                ->route('login')
                ->with('status', 'Email Google belum terverifikasi.');
        }

        $user = User::query()->where('email', $email)->first();

        if ($user === null) {
            $user = User::query()->create([
                'name' => is_string($name) && trim($name) !== '' ? $name : Str::before($email, '@'),
                'email' => $email,
                'email_verified_at' => now(),
                'password' => Hash::make(Str::random(64)),
                'role' => UserRole::Customer,
            ]);
        } elseif ($user->email_verified_at === null) {
            $user->forceFill([
                'email_verified_at' => now(),
            ])->save();
        }

        Auth::login($user, true);
        request()->session()->regenerate();

        return redirect()->intended('/engineering');
    }

    private function isConfigured(): bool
    {
        return filled(config('services.google.client_id'))
            && filled(config('services.google.client_secret'))
            && filled(config('services.google.redirect'));
    }
}
