'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';
import { 
  SalesStatsService, 
  SalesTrendPoint,
  TotalSalesResponse,
  DailySalesResponse,
  WeeklySalesResponse,
  MonthlySalesResponse,
  CustomPeriodSalesResponse,
  PaymentSuccessRateResponse,
} from '@/services/salesStats';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';

// 숫자 포맷팅 함수
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 원화 포맷팅 함수
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
};

const SalesStatsPage = () => {
  // 상태 관리
  const [loading, setLoading] = useState<boolean>(true);
  const [totalSales, setTotalSales] = useState<TotalSalesResponse | null>(null);
  const [dailySales, setDailySales] = useState<DailySalesResponse | null>(null);
  const [weeklySales, setWeeklySales] = useState<WeeklySalesResponse | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesResponse | null>(null);
  const [customPeriodSales, setCustomPeriodSales] = useState<CustomPeriodSalesResponse | null>(null);
  const [successRate, setSuccessRate] = useState<PaymentSuccessRateResponse | null>(null);
  
  // 트렌드 데이터
  const [trendType, setTrendType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [trendData, setTrendData] = useState<SalesTrendPoint[]>([]);
  
  // 사용자 지정 기간
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  
  // 데이터 로딩
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          totalSalesData,
          dailySalesData,
          weeklySalesData,
          monthlySalesData,
          successRateData,
          trendData,
        ] = await Promise.all([
          SalesStatsService.getTotalSales(),
          SalesStatsService.getDailySales(),
          SalesStatsService.getWeeklySales(),
          SalesStatsService.getMonthlySales(),
          SalesStatsService.getPaymentSuccessRate(),
          fetchTrendData(trendType),
        ]);
        
        setTotalSales(totalSalesData);
        setDailySales(dailySalesData);
        setWeeklySales(weeklySalesData);
        setMonthlySales(monthlySalesData);
        setSuccessRate(successRateData);
        setTrendData(trendData);
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // 트렌드 타입 변경 시 데이터 다시 로딩
  useEffect(() => {
    const loadTrendData = async () => {
      try {
        const data = await fetchTrendData(trendType);
        setTrendData(data);
      } catch (error) {
        console.error('트렌드 데이터 로딩 오류:', error);
      }
    };
    
    loadTrendData();
  }, [trendType]);
  
  // 트렌드 데이터 가져오기
  const fetchTrendData = async (type: 'daily' | 'weekly' | 'monthly'): Promise<SalesTrendPoint[]> => {
    try {
      let response;
      switch (type) {
        case 'daily':
          response = await SalesStatsService.getDailySalesTrend();
          break;
        case 'weekly':
          response = await SalesStatsService.getWeeklySalesTrend();
          break;
        case 'monthly':
          response = await SalesStatsService.getMonthlySalesTrend();
          break;
      }
      return response.data;
    } catch (error) {
      console.error(`${type} 트렌드 데이터 로딩 오류:`, error);
      return [];
    }
  };
  
  // 사용자 지정 기간 매출 조회
  const handleCustomPeriodSearch = async () => {
    if (!startDate || !endDate) return;
    
    try {
      const params = {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      };
      
      const data = await SalesStatsService.getCustomPeriodSales(params);
      setCustomPeriodSales(data);
      
      // 사용자 지정 기간 트렌드 데이터도 함께 조회
      const trendData = await SalesStatsService.getCustomPeriodSalesTrend(params);
      setTrendData(trendData.data);
      setTrendType('daily'); // 사용자 지정 기간 조회 시 일별 트렌드로 설정
    } catch (error) {
      console.error('사용자 지정 기간 매출 조회 오류:', error);
    }
  };
  
  // 트렌드 타입 변경 핸들러
  const handleTrendTypeChange = (event: SelectChangeEvent) => {
    setTrendType(event.target.value as 'daily' | 'weekly' | 'monthly');
  };
  
  // 결제 성공률 파이 차트 데이터
  const getSuccessRateChartData = () => {
    if (!successRate) return [];
    
    return [
      { name: '성공', value: successRate.successfulPayments },
      { name: '실패', value: successRate.totalAttempts - successRate.successfulPayments },
    ];
  };
  
  const COLORS = ['#4caf50', '#f44336'];
  
  if (loading) {
    return (
      <AdminLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          매출 통계
        </Typography>
        
        {/* 요약 카드 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  총 매출
                </Typography>
                <Typography variant="h5" component="div">
                  {totalSales ? formatCurrency(totalSales.totalSales) : '0원'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  총 {totalSales ? formatNumber(totalSales.totalCount) : '0'}건
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  오늘 매출
                </Typography>
                <Typography variant="h5" component="div">
                  {dailySales ? formatCurrency(dailySales.dailySales) : '0원'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  총 {dailySales ? formatNumber(dailySales.dailyCount) : '0'}건
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  이번 주 매출
                </Typography>
                <Typography variant="h5" component="div">
                  {weeklySales ? formatCurrency(weeklySales.weeklySales) : '0원'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  총 {weeklySales ? formatNumber(weeklySales.weeklyCount) : '0'}건
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  이번 달 매출
                </Typography>
                <Typography variant="h5" component="div">
                  {monthlySales ? formatCurrency(monthlySales.monthlySales) : '0원'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  총 {monthlySales ? formatNumber(monthlySales.monthlyCount) : '0'}건
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* 사용자 지정 기간 검색 */}
        <Card sx={{ mb: 4 }}>
          <CardHeader title="기간별 매출 조회" />
          <Divider />
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                  <DatePicker
                    label="시작 날짜"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
                  <DatePicker
                    label="종료 날짜"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={handleCustomPeriodSearch}
                >
                  조회
                </Button>
              </Grid>
            </Grid>
            
            {customPeriodSales && (
              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  {customPeriodSales.startDate} ~ {customPeriodSales.endDate} 기간 매출
                </Typography>
                <Typography variant="h5" gutterBottom>
                  {formatCurrency(customPeriodSales.totalSales)}
                </Typography>
                <Typography variant="body1">
                  총 {formatNumber(customPeriodSales.totalCount)}건
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
        
        {/* 매출 추이 그래프 */}
        <Card sx={{ mb: 4 }}>
          <CardHeader 
            title="매출 추이" 
            action={
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="trend-type-label">기간</InputLabel>
                <Select
                  labelId="trend-type-label"
                  value={trendType}
                  label="기간"
                  onChange={handleTrendTypeChange}
                >
                  <MenuItem value="daily">일별</MenuItem>
                  <MenuItem value="weekly">주별</MenuItem>
                  <MenuItem value="monthly">월별</MenuItem>
                </Select>
              </FormControl>
            }
          />
          <Divider />
          <CardContent>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `날짜: ${label}`}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="amount"
                    name="매출액"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="count"
                    name="결제 건수"
                    stroke="#82ca9d"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
        
        {/* 결제 성공률 */}
        <Card>
          <CardHeader title="결제 성공률" />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getSuccessRateChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getSuccessRateChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" justifyContent="center" height="100%">
                  {successRate && (
                    <>
                      <Typography variant="h6" gutterBottom>
                        결제 성공률: {successRate.successRate}%
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        총 결제 시도: {formatNumber(successRate.totalAttempts)}건
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        성공한 결제: {formatNumber(successRate.successfulPayments)}건
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        실패한 결제: {formatNumber(successRate.totalAttempts - successRate.successfulPayments)}건
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        기준 날짜: {successRate.date}
                      </Typography>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </AdminLayout>
  );
};

export default SalesStatsPage;
