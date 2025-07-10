<div class="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
  <form [formGroup]="loginForm"
        (ngSubmit)="onLogin()"
        class="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-xl space-y-6">

    <h2 class="text-2xl font-bold text-center text-gray-800">Welcome Back</h2>

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
      <input
        type="email"
        id="email"
        formControlName="email"
        autocomplete="email"
        required
        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
      <input
        type="password"
        id="password"
        formControlName="password"
        autocomplete="current-password"
        required
        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      <button type="button"
              (click)="forgotPassword()"
              class="block mt-1 text-sm text-indigo-600 hover:underline float-right">
        Forgot password?
      </button>
    </div>

    <button
      type="submit"
      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition"
    >
      Login
    </button>

    <p class="mt-6 text-center text-sm text-gray-200">
      Don’t have an account?
      <a routerLink="/signup" class="text-white font-medium hover:underline">Sign up</a>
    </p>
  </form>
</div>
