# Statistics API Implementation

## Overview

The Statistics API provides comprehensive statistical data queries and report export functionality for the University Internship Management System. It supports filtering by time periods and generates reports in Excel and PDF formats.

## Requirements Addressed

- **Requirement 8.2**: Statistics by time period (monthly, semester)
- **Requirement 8.3**: Enterprise position and student distribution statistics
- **Requirement 8.4**: Exportable statistical reports (PDF and Excel formats)
- **Requirement 8.5**: Real-time statistics updates when filter conditions change

## API Endpoints

### 1. Get Statistics Overview

**Endpoint**: `GET /api/statistics/overview`

**Access**: Teacher only

**Query Parameters**:
- `startDate` (optional): Start date for filtering (YYYY-MM-DD)
- `endDate` (optional): End date for filtering (YYYY-MM-DD)
- `period` (optional): Predefined period (month|semester|year)

**Response**:
```json
{
  "success": true,
  "data": {
    "applications": {
      "total": 100,
      "approved": 75,
      "rejected": 15,
      "pending": 10,
      "approvalRate": 75.00
    },
    "internships": {
      "total": 75,
      "ongoing": 50,
      "completed": 20,
      "pendingEvaluation": 5
    },
    "positions": {
      "total": 50,
      "open": 30,
      "full": 20
    },
    "enterprises": [
      {
        "id": 1,
        "companyName": "ABC Company",
        "industry": "Technology",
        "positionCount": 10,
        "studentCount": 25,
        "averageScore": "85.50"
      }
    ],
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "period": null
    }
  },
  "message": "统计数据获取成功"
}
```

### 2. Get Enterprise Statistics

**Endpoint**: `GET /api/statistics/enterprise/:enterpriseId`

**Access**: Teacher, Enterprise (own data)

**Query Parameters**:
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering

**Response**:
```json
{
  "success": true,
  "data": {
    "enterprise": {
      "id": 1,
      "companyName": "ABC Company",
      "industry": "Technology"
    },
    "positions": {
      "total": 10,
      "open": 5,
      "full": 3,
      "closed": 2,
      "totalSlots": 50,
      "availableSlots": 15
    },
    "studentDistribution": [
      {
        "positionId": 1,
        "positionTitle": "Frontend Developer Intern",
        "studentCount": 5,
        "averageScore": "88.50"
      }
    ]
  },
  "message": "企业统计数据获取成功"
}
```

### 3. Get Time-Series Statistics

**Endpoint**: `GET /api/statistics/timeseries`

**Access**: Teacher only

**Query Parameters**:
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)
- `groupBy` (optional): Grouping interval (day|week|month|year), default: month

**Response**:
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "period": "2024-01",
        "total": 20,
        "approved": 15,
        "rejected": 3,
        "pending": 2
      }
    ],
    "internships": [
      {
        "period": "2024-01",
        "total": 15,
        "ongoing": 10,
        "completed": 5,
        "pendingEvaluation": 0
      }
    ],
    "groupBy": "month",
    "dateRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    }
  },
  "message": "时间序列统计数据获取成功"
}
```

### 4. Export Excel Report

**Endpoint**: `GET /api/statistics/export/excel`

**Access**: Teacher only

**Query Parameters**:
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `period` (optional): Predefined period (month|semester|year)

**Response**: Excel file download (.xlsx)

**Excel Structure**:
- **Sheet 1 - 统计概览**: Summary statistics with application, internship, and position data
- **Sheet 2 - 企业统计**: Detailed enterprise statistics with position and student counts

### 5. Export PDF Report

**Endpoint**: `GET /api/statistics/export/pdf`

**Access**: Teacher only

**Query Parameters**:
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `period` (optional): Predefined period (month|semester|year)

**Response**: PDF file download

**PDF Structure**:
- Title and date range
- Application statistics
- Internship statistics
- Position statistics
- Top 10 enterprises by position count

## Filter Responsiveness (Requirement 8.5)

The statistics API implements responsive filter updates through query parameters. When filter conditions change, the API recalculates statistics based on the new filters:

1. **Date Range Filters**: Use `startDate` and `endDate` to filter by custom date range
2. **Period Filters**: Use `period` parameter for predefined periods (month, semester, year)
3. **Time Grouping**: Use `groupBy` parameter in time-series endpoint to change aggregation level

**Example - Changing Filters**:
```javascript
// Request 1: Monthly statistics
GET /api/statistics/overview?period=month

// Request 2: Yearly statistics (filter changed)
GET /api/statistics/overview?period=year

// Request 3: Custom date range (filter changed)
GET /api/statistics/overview?startDate=2024-06-01&endDate=2024-12-31
```

Each request recalculates statistics based on the provided filters, ensuring real-time updates.

## Implementation Details

### Database Queries

The statistics controller uses:
- **Sequelize ORM**: For basic counting and filtering
- **Raw SQL Queries**: For complex aggregations and joins (enterprise statistics)

### Performance Considerations

- Indexes on `createdAt`, `status`, and foreign key columns improve query performance
- Enterprise statistics query uses LEFT JOINs to include enterprises with no positions/students
- Time-series queries use DATE_FORMAT for efficient grouping

### Export Libraries

- **ExcelJS**: For Excel file generation with multiple sheets and styling
- **PDFKit**: For PDF document generation with formatted text

## Testing

Run the test script to verify all endpoints:

```bash
node backend/test-statistics.js
```

The test script covers:
1. Statistics overview without filters
2. Statistics with date range filter
3. Statistics with period filter
4. Enterprise-specific statistics
5. Time-series statistics
6. Filter responsiveness (multiple requests with different filters)
7. Excel export
8. PDF export

## Error Handling

All endpoints include proper error handling:
- **400 Bad Request**: Invalid query parameters
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Enterprise not found (for enterprise statistics)
- **500 Internal Server Error**: Database or processing errors

## Security

- All endpoints require authentication via JWT token
- Role-based access control (RBAC) restricts access to teachers
- Enterprise statistics endpoint allows enterprises to view their own data
- SQL injection prevention through parameterized queries

## Future Enhancements

Potential improvements:
1. Caching for frequently accessed statistics
2. Real-time statistics updates via WebSocket
3. More export formats (CSV, JSON)
4. Advanced filtering (by major, grade, industry)
5. Data visualization charts in PDF reports
6. Scheduled report generation and email delivery
