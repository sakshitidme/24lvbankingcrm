// import { Sidebar } from '@/components/layout/sidebar'
// import { ProtectedRoute } from '@/components/auth/protected-route'

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <ProtectedRoute>
//       <div className="min-h-screen bg-gray-50">
//         <Sidebar />
//         <div className="lg:pl-64">
//           <main className="min-h-screen">
//             {children}
//           </main>
//         </div>
//       </div>
//     </ProtectedRoute>
//   )
// }

/*dfghjkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk*/
//  import { Sidebar } from '@/components/layout/sidebar'
// import { ProtectedRoute } from '@/components/auth/protected-route'

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <ProtectedRoute>
//       <div className="min-h-screen bg-gray-50 flex justify-center">
//         <div className="flex w-full max-w-screen-xl">
//           {/* Sidebar - 30% */}
//           <div className="w-1/3 min-w-[250px] max-w-[400px]">
//             <Sidebar />
//           </div>

//           {/* Main Content - 70% */}
//           <div className="w-2/3 p-4">
//             <main className="min-h-screen">{children}</main>
//           </div>
//         </div>
//       </div>
//     </ProtectedRoute>
//   )
// }
import { Sidebar } from '@/components/layout/sidebar'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex justify-center px-4">
        <div className="flex w-full max-w-screen-xl">
          {/* Sidebar - Fixed width (approx. 30%) */}
          <div className="w-[20%] min-w-[250px] max-w-[400px]">
            <Sidebar />
          </div>

          {/* Main Content - Remaining width (approx. 70%) */}
          <div className="flex-1 p-4">
            <main className="min-h-screen">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
