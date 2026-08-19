// app/HomeLoading.tsx

export default function HomeLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center space-y-8">
        {/* اللوجو */}
        <div className="relative w-32 h-32">
          {/* <img
            src="/logo.png"
            alt="اللوجو"
            className="object-contain w-full h-full"
          /> */}
          logo
        </div>

        {/* مؤشر التحميل */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm font-medium">
            جاري تحميل الصفحة...
          </p>
        </div>
      </div>
    </div>
  );
}