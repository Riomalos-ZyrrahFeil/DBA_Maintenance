<?php
header("Content-Type: application/json");
include '../../db.php';

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'program_id';
$order = isset($_GET['order']) && strtolower($_GET['order']) === 'asc' ? 'ASC' : 'DESC';

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = ($page - 1) * $limit; // Calculate SQL OFFSET

// Whitelist columns to prevent SQL injection
$allowed_columns = ['program_id', 'program_code', 'program_name', 'dept_name'];
if (!in_array($sort_by, $allowed_columns)) {
    $sort_by = 'program_id';
}

$searchParam = "%{$search}%";
$whereClause = "p.is_deleted = 0 AND (p.program_code LIKE ? OR p.program_name LIKE ? OR d.dept_name LIKE ?)";
$paramTypes = "sss";
$searchParams = [$searchParam, $searchParam, $searchParam];

$countSql = "SELECT COUNT(p.program_id) as total 
             FROM tbl_program p
             JOIN tbl_department d ON p.dept_id = d.dept_id
             WHERE $whereClause";

$totalRecords = 0;
$stmtCount = $conn->prepare($countSql);
$stmtCount->bind_param($paramTypes, ...$searchParams);
$stmtCount->execute();
$resultCount = $stmtCount->get_result();
$totalRecords = $resultCount->fetch_assoc()['total'];
$stmtCount->close();

$dataSql = "
  SELECT p.program_id, p.program_code, p.program_name, p.dept_id, d.dept_name 
  FROM tbl_program p
  JOIN tbl_department d ON p.dept_id = d.dept_id
  WHERE $whereClause
  ORDER BY $sort_by $order
  LIMIT ? OFFSET ?
";

$programs = [];
$finalParams = array_merge($searchParams, [$limit, $offset]);
$finalTypes = $paramTypes . "ii";

$stmtData = $conn->prepare($dataSql);
$stmtData->bind_param($finalTypes, ...$finalParams);
$stmtData->execute();
$resultData = $stmtData->get_result();

while ($row = $resultData->fetch_assoc()) {
  $programs[] = $row;
}

$stmtData->close();
$conn->close();

echo json_encode([
  'data' => $programs,
  'total_records' => $totalRecords
]);
?>