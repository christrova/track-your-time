import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center  py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-4xl font-bold">Track My Time</h1>
        <div className="flex flex-row justify-between w-full">
          <Link className="text-blue-500 my-4 text-lg" href="/auth">Auth</Link>
          <Link className="text-blue-500 my-4 text-lg" href="/dashboard">dashboard</Link>
          <Link className="text-blue-500 my-4 text-lg" href="/settings">settings</Link>
          <Link className="text-blue-500 my-4 text-lg" href="/u/rovaencoder">u/rovaencoder</Link>
        </div>
      </main>
    </div>
  );
}
