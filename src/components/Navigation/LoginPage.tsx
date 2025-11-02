
export default function LoginPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <a
        href="http://localhost:4000/auth/discord/login"
        className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Login with Discord
      </a>
    </div>
  );
}
