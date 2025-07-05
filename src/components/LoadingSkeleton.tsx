import React from 'react';

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  height = 'h-4', 
  width = 'w-full', 
  rounded = 'rounded' 
}) => (
  <div 
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${height} ${width} ${rounded} ${className}`}
  />
);

// Ticket Card Skeleton
export const TicketCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <Skeleton height="h-5" width="w-3/4" />
        <Skeleton height="h-4" width="w-1/2" />
      </div>
      <Skeleton height="h-6" width="w-16" rounded="rounded-full" />
    </div>
    <Skeleton height="h-4" width="w-full" />
    <div className="flex items-center justify-between">
      <Skeleton height="h-4" width="w-20" />
      <Skeleton height="h-4" width="w-24" />
    </div>
  </div>
);

// Dashboard Stats Skeleton
export const StatsCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center justify-between mb-4">
      <Skeleton height="h-4" width="w-24" />
      <Skeleton height="h-8" width="w-8" rounded="rounded-lg" />
    </div>
    <Skeleton height="h-8" width="w-16" className="mb-2" />
    <Skeleton height="h-3" width="w-20" />
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton: React.FC = () => (
  <tr className="border-b border-gray-200 dark:border-gray-700">
    <td className="px-6 py-4">
      <Skeleton height="h-4" width="w-20" />
    </td>
    <td className="px-6 py-4">
      <Skeleton height="h-4" width="w-48" />
    </td>
    <td className="px-6 py-4">
      <Skeleton height="h-4" width="w-24" />
    </td>
    <td className="px-6 py-4">
      <Skeleton height="h-6" width="w-16" rounded="rounded-full" />
    </td>
    <td className="px-6 py-4">
      <Skeleton height="h-4" width="w-20" />
    </td>
    <td className="px-6 py-4">
      <Skeleton height="h-8" width="w-20" rounded="rounded-lg" />
    </td>
  </tr>
);

// Form Field Skeleton
export const FormFieldSkeleton: React.FC = () => (
  <div className="space-y-2">
    <Skeleton height="h-4" width="w-20" />
    <Skeleton height="h-10" width="w-full" rounded="rounded-lg" />
  </div>
);

// Modal Skeleton
export const ModalSkeleton: React.FC = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Skeleton height="h-10" width="w-10" rounded="rounded-lg" />
          <div className="space-y-2">
            <Skeleton height="h-6" width="w-32" />
            <Skeleton height="h-4" width="w-48" />
          </div>
        </div>
        <Skeleton height="h-6" width="w-6" rounded="rounded" />
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-4">
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <div className="flex gap-3 pt-4">
          <Skeleton height="h-10" width="w-20" rounded="rounded-lg" />
          <Skeleton height="h-10" width="w-24" rounded="rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

// List Skeleton
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <Skeleton height="h-5" width="w-1/3" />
          <Skeleton height="h-6" width="w-16" rounded="rounded-full" />
        </div>
        <Skeleton height="h-4" width="w-full" className="mb-2" />
        <Skeleton height="h-4" width="w-2/3" />
      </div>
    ))}
  </div>
);

// Chart Skeleton
export const ChartSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center justify-between mb-6">
      <Skeleton height="h-6" width="w-32" />
      <Skeleton height="h-8" width="w-24" rounded="rounded-lg" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton height="h-4" width="w-16" />
          <div className="flex-1">
            <Skeleton height="h-4" width={`${Math.random() * 60 + 20}%`} />
          </div>
          <Skeleton height="h-4" width="w-12" />
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton; 