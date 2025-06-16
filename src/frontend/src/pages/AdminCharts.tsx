import { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';

interface RevenueItem {
  date: string;
  revenue: number;
}

interface OrderStatusItem {
  status: string;
  count: number;
}

interface TopProductItem {
  name: string;
  sold: number;
}

const STATUS_ORDER = ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao hàng', 'Giao thất bại', 'Hoàn thành','Đã huỷ'];
const STATUS_COLORS: Record<string, string> = {
  'Chờ xác nhận': '#facc15',
  'Đã xác nhận': '#38bdf8',
  'Đang giao hàng': '#6366f1',
  'Giao thất bại': '#ef4444',
  'Hoàn thành': '#22c55e',
  'Đã huỷ': '#b91c1c'
};

export default function AdminRevenueDashboard() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueItem[]>([]);
  const [summary, setSummary] = useState<{ totalRevenue: number }>({ totalRevenue: 0 });
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [totalProductsSold, setTotalProductsSold] = useState(0);
  const [fromDate, setFromDate] = useState('2025-05-01');
  const [toDate, setToDate] = useState('2025-06-30');

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revenueRes, statusRes, topRes] = await Promise.all([
        axios.get('http://localhost:5000/orders/revenue-summary', {
          params: { unit: 'day', from: fromDate, to: toDate },
        }),
        axios.get('http://localhost:5000/orders/order-status-summary', {
          params: { from: fromDate, to: toDate },
        }),
        axios.get('http://localhost:5000/orders/top-products', {
          params: { from: fromDate, to: toDate },
        }),
      ]);

      const data: RevenueItem[] = Array.isArray(revenueRes.data) ? revenueRes.data : [];
      setRevenueData(data);
      setOrderStatusData(statusRes.data);
      setTopProducts(topRes.data);

      const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
      setSummary({ totalRevenue });

      const totalSold = topRes.data.reduce((sum: number, p: TopProductItem) => sum + p.sold, 0);
      setTotalProductsSold(totalSold);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      setRevenueData([]);
      setOrderStatusData([]);
      setTopProducts([]);
      setSummary({ totalRevenue: 0 });
      setTotalProductsSold(0);
    } finally {
      setLoading(false);
    }
  };

  const renderDateRangeSelector = () => (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-4">
      <DateInput label="Từ ngày" value={fromDate} onChange={setFromDate} />
      <DateInput label="Đến ngày" value={toDate} onChange={setToDate} />
    </div>
  );

  const renderChart = () => {
  if (revenueData.length === 0) {
    return <div className="text-gray-400 italic text-center">Không có dữ liệu để hiển thị.</div>;
  }

  return (
    <Chart
      type="area"
      height={300}
      series={[{ name: 'Doanh thu', data: revenueData.map((d) => d.revenue) }]}
      options={{
        chart: { toolbar: { show: false } },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#6366f1'],
        xaxis: {
          categories: revenueData.map((d) => d.date),
          labels: { rotate: -45 },
        },
        yaxis: {
          labels: {
            formatter: (val) =>
              val.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0,
              }),
          },
        },
        tooltip: {
          y: {
            formatter: (val) =>
              val.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }),
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => val.toLocaleString('vi-VN'),
          style: {
            fontWeight: 'bold',
            colors: ['#111'],
          },
        },
        grid: { strokeDashArray: 4 },
      }}
    />
  );
};


 const renderBarChart = () => (
  <Chart
    type="bar"
    height={300}
    series={[{ name: 'Doanh thu', data: revenueData.map((d) => d.revenue) }]}
    options={{
      chart: { toolbar: { show: false } },
      xaxis: { categories: revenueData.map((d) => d.date) },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
      colors: ['#10b981'],
      tooltip: {
        y: {
          formatter: (val) =>
            val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
        },
      },
      yaxis: {
        labels: {
          formatter: (val) =>
            val.toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND',
              maximumFractionDigits: 0,
            }),
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => val.toLocaleString('vi-VN'),
        style: {
          fontSize: '13px',
          fontWeight: 'bold',
          colors: ['#fff'],
        },
      },
    }}
  />
);



  const renderOrderStatusChart = () => {
    if (orderStatusData.length === 0) {
      return <div className="text-gray-400 italic text-center">Không có dữ liệu trạng thái đơn hàng.</div>;
    }

    const total = orderStatusData.reduce((sum, item) => sum + item.count, 0);

    return (
      <>
        <Chart
          type="donut"
          height={300}
          series={STATUS_ORDER.map((status) => {
            const item = orderStatusData.find((o) => o.status === status);
            return item ? item.count : 0;
          })}
          options={{
            labels: STATUS_ORDER,
            colors: STATUS_ORDER.map((status) => STATUS_COLORS[status]),
            legend: { position: 'bottom' },
          }}
        />
        <div className="mt-4 text-sm space-y-2">
          {STATUS_ORDER.map((status) => {
            const item = orderStatusData.find((o) => o.status === status);
            if (!item) return null;
            const percent = ((item.count / total) * 100).toFixed(1);
            return (
              <p key={status} className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }}></span>
                <span className="text-gray-700 font-medium">{status}:</span>
                <span className="text-gray-600">{item.count} đơn ({percent}%)</span>
              </p>
            );
          })}
        </div>
      </>
    );
  };

  const renderTopProductsChart = () => {
    if (topProducts.length === 0) {
      return <div className="text-gray-400 italic text-center">Không có dữ liệu sản phẩm bán chạy.</div>;
    }

    return (
      <Chart
        type="bar"
        height={300}
        series={[{ name: 'Số lượng bán', data: topProducts.map(p => p.sold) }]}
        options={{
          chart: { toolbar: { show: false } },
          xaxis: { categories: topProducts.map(p => p.name) },
          plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
          colors: ['#f97316'],
          tooltip: { y: { formatter: (val) => `${val} sản phẩm` } },
        }}
      />
    );
  };

  return (
    <div className="max-w-7xl mx-auto  space-y-10 bg-gradient-to-tr from-white to-gray-50 min-h-screen rounded-xl">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 pb-2">
        THỐNG KÊ DOANH THU 
      </h2>

      {renderDateRangeSelector()}

      {loading ? (
        <div className="text-center mt-12 text-indigo-600 text-lg font-semibold animate-pulse">
          Đang tải dữ liệu thống kê...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard label="Tổng doanh thu" value={`${summary.totalRevenue.toLocaleString('vi-VN')} đ`} />
          <StatCard label="Tổng sản phẩm đã bán" value={`${totalProductsSold.toLocaleString()}`} />

          <ChartCard title="Biểu đồ doanh thu theo ngày">
            {renderChart()}
          </ChartCard>

          <ChartCard title="Biểu đồ doanh thu (cột)">
            {renderBarChart()}
          </ChartCard>

          <ChartCard title="Trạng thái đơn hàng toàn hệ thống">
            {renderOrderStatusChart()}
          </ChartCard>

          <ChartCard title="Top sản phẩm bán chạy">
            {renderTopProductsChart()}
          </ChartCard>
        </div>
      )}
    </div>
  );
}

const DateInput = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => (
  <div className="flex flex-col">
    <label className="text-xs text-gray-600 mb-1">{label}</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
    />
  </div>
);

const StatCard = ({ label, value }: { label: string; value: any }) => (
  <div className="bg-gradient-to-tr from-white to-indigo-50 rounded-xl shadow-sm p-6 border border-indigo-200 text-center hover:shadow-md transition">
    <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
    <h3 className="text-4xl font-extrabold text-indigo-800">{value}</h3>
  </div>
);

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
    <h4 className="text-lg font-semibold mb-4 text-gray-700">{title}</h4>
    {children}
  </div>
);
