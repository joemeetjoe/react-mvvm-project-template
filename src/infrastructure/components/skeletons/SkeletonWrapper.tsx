// // components/SkeletonWrapper.tsx
// import { Skeleton } from '@/shadCn';
// import { ReactElement } from 'react';
// import { TBaseSkeletonConfig } from '@/commonTypes';
// import { AppTableCard } from "@/appComponents";
//
// interface SkeletonWrapperProps {
//     children: ReactElement;
//     isLoading: boolean;
//     config?: TBaseSkeletonConfig;
// }
//
// export function SkeletonWrapper({
//                                     children,
//                                     isLoading,
//                                     config
//                                 }: SkeletonWrapperProps) {
//     if (!isLoading) {
//         return children;
//     }
//
//     if (!config) {
//         // Fallback: basic skeleton
//         return <Skeleton className="h-20 w-full" />;
//     }
//
//     switch (config.type) {
//         case 'table':
//             return <TableSkeleton config={config} />;
//         case 'grid':
//             return <GridSkeleton config={config} />;
//         case 'list':
//             return <ListSkeleton config={config} />;
//         case 'card':
//             return <CardSkeleton config={config} />;
//         default:
//             return <Skeleton className="h-20 w-full" />;
//     }
// }
//
// // Table Skeleton
// function TableSkeleton({ config }: { config: TBaseSkeletonConfig }) {
//     const rows = config.rows || 5;
//     const columns = config.columns || 4;
//
//     return (
//
//     //     <div className="space-y-4">
//     //         {ui.showHeader && (
//     //             <div className="flex justify-between items-center">
//     //                 <Skeleton className="h-8 w-48" />
//     //                 <Skeleton className="h-10 w-32" />
//     //             </div>
//     //         )}
//
//             <AppTableCard>
//                 <div className="border rounded-lg">
//                     {/* Header Row */}
//                     <div className="flex gap-4 p-4 border-b">
//                         {config.showCheckboxes && <Skeleton className="h-4 w-4" />}
//                         {Array.from({ length: columns }).map((_, i) => (
//                             <Skeleton key={i} className="h-4 flex-1" />
//                         ))}
//                     </div>
//
//                     {/* Data Rows */}
//                     {Array.from({ length: rows }).map((_, rowIdx) => (
//                         <div key={rowIdx} className="flex gap-4 p-4 border-b last:border-b-0">
//                             {config.showCheckboxes && <Skeleton className="h-4 w-4" />}
//                             {Array.from({ length: columns }).map((_, colIdx) => (
//                                 <Skeleton key={colIdx} className="h-4 flex-1" />
//                             ))}
//                         </div>
//                     ))}
//                 </div>
//                 {config.showPagination && (
//                     <div className="flex items-center gap-2">
//                         <Skeleton className="h-10 w-10" />
//                         <Skeleton className="h-10 w-10" />
//                         <Skeleton className="h-10 w-24" />
//                     </div>
//                 )}
//             </AppTableCard>
//
//
//
//         // </div>
//     );
// }
//
// // Grid Skeleton
// function GridSkeleton({ config }: { config: TBaseSkeletonConfig }) {
//     const items = config.rows || 12;
//     const cols = config.gridColumns || 3;
//     const gap = config.gap || 4;
//
//     return (
//         <div
//             className={`grid gap-${gap}`}
//             style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
//         >
//             {Array.from({ length: items }).map((_, i) => (
//                 <Skeleton
//                     key={i}
//                     className={config.itemHeight || "h-48"}
//                 />
//             ))}
//         </div>
//     );
// }
//
// // List Skeleton
// function ListSkeleton({ config }: { config: TBaseSkeletonConfig }) {
//     const items = config.rows || 5;
//
//     return (
//         <div className={`space-y-${config.gap || 3}`}>
//             {Array.from({ length: items }).map((_, i) => (
//                 <div key={i} className="flex items-center gap-4">
//                     <Skeleton className="h-12 w-12 rounded-full" />
//                     <div className="flex-1 space-y-2">
//                         <Skeleton className="h-4 w-3/4" />
//                         <Skeleton className="h-3 w-1/2" />
//                     </div>
//                 </div>
//             ))}
//         </div>
//     );
// }
//
// // Card Skeleton
// function CardSkeleton({ config }: { config: TBaseSkeletonConfig }) {
//     return (
//         <div className="border rounded-lg p-6 space-y-4">
//             {config.showHeader && <Skeleton className="h-8 w-48" />}
//             <Skeleton className="h-32 w-full" />
//             <div className="space-y-2">
//                 <Skeleton className="h-4 w-full" />
//                 <Skeleton className="h-4 w-5/6" />
//                 <Skeleton className="h-4 w-4/6" />
//             </div>
//         </div>
//     );
// }
