import React, { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: (item: T) => ReactNode;
  className?: string;
}

interface TransactionTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title: string;
  renderActions?: (item: T) => ReactNode;
  showActions?: boolean;
}

const statusColors: { [key: string]: string } = {
  Paid: 'bg-green-100 text-green-800',
  Partial: 'bg-yellow-100 text-yellow-800',
  Unpaid: 'bg-red-100 text-red-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Pending: 'bg-orange-100 text-orange-800',
};

export const StatusPill: React.FC<{ status: string }> = ({ status }) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
    </span>
);

const TransactionTable = <T extends { id: string }>(
  { columns, data, title, renderActions, showActions = true }: TransactionTableProps<T>
) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="font-bold text-lg text-slate-800 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              {columns.map((col, index) => (
                <th key={index} scope="col" className={`px-6 py-3 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
               {showActions && <th scope="col" className="px-6 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                {columns.map((col, index) => (
                  <td key={index} className={`px-6 py-4 ${col.className || ''}`}>
                    {col.accessor(item)}
                  </td>
                ))}
                {showActions && 
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                    {renderActions ? (
                        renderActions(item)
                    ) : (
                        <>
                        <button className="font-medium text-diesel-blue hover:underline mr-4">Edit</button>
                        <button className="font-medium text-red-600 hover:underline">Delete</button>
                        </>
                    )}
                    </td>
                }
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;