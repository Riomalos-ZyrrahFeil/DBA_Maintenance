<?php
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');
include '../../db.php';

// --- GET PARAMETERS ---
$search = $_GET['search'] ?? '';
$sort_by = $_GET['sort_by'] ?? 'dept_id';
$order = strtoupper($_GET['order'] ?? 'DESC');

$page   = (int) ($_GET['page'] ?? 1);
$limit  = (int) ($_GET['limit'] ?? 10);
$offset = ($page - 1) * $limit;

$allowed_columns = ['dept_id', 'dept_code', 'dept_name'];
if (!in_array($sort_by, $allowed_columns)) {
    $sort_by = 'dept_id';
}
if ($order !== 'ASC' && $order !== 'DESC') {
    $order = 'DESC';
}

$whereClause = "WHERE is_deleted = 0";
$searchParams = [];
$paramTypes = "";

if (!empty($search)) {
    $whereClause .= " AND (dept_code LIKE ? OR dept_name LIKE ?)";
    $search_term = "%$search%";
    $searchParams = [$search_term, $search_term];
    $paramTypes = "ss";
}

$count_sql = "SELECT COUNT(*) as total FROM tbl_department $whereClause";
$total_records = 0;

$count_stmt = $conn->prepare($count_sql);
if (!empty($searchParams)) {
    $count_stmt->bind_param($paramTypes, ...$searchParams);
}
$count_stmt->execute();
$count_result = $count_stmt->get_result();
$total_records = $count_result->fetch_assoc()['total'];
$count_stmt->close();

$select_sql = "SELECT * FROM tbl_department 
               $whereClause
               ORDER BY $sort_by $order 
               LIMIT ? OFFSET ?";

$departments = [];
$finalParams = array_merge($searchParams, [$limit, $offset]);
$finalTypes = $paramTypes . "ii";

$stmt = $conn->prepare($select_sql);
$stmt->bind_param($finalTypes, ...$finalParams);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $departments[] = $row;
}
$stmt->close();
$conn->close();

echo json_encode([
    'data' => $departments,
    'total_records' => $total_records
]);
?>