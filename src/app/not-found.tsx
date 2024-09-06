export const runtime = "edge";

export default function NotFound() {
  return (
    <>
      <div className='w-full max-w-4xl shadow-md rounded-lg p-6 light:bg-gray-900 dark:bg-black'>
        <h2>404: This page could not be found.</h2>
      </div>
    </>
  );
}

