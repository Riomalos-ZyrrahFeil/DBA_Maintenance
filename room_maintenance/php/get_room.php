<?php
error_reporting(E_ERROR | E_PARSE);
header('Content-Type: application/json');
include '../../db.php';

$search = isset($_GET['search']) ? $_GET['search'] : '';
$sortBy = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'room_id';
$order 	= isset($_GET['order']) && strtolower($_GET['order']) === 'asc' ? 'ASC' : 'DESC';

$page 	= isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit 	= isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = ($page - 1) * $limit;

$allowedCols = ['room_id', 'room_code', 'capacity', 'building'];
if (!in_array($sortBy, $allowedCols)) {
    $sortBy = 'room_id';
}

if (isset($_GET['room_id'])) {
    $id = intval($_GET['room_id']);
    $stmt = $conn->prepare("SELECT * FROM tbl_room WHERE room_id = ? AND is_delete = 0");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_assoc());
    $stmt->close();
    exit;
}

$whereClause = "WHERE is_delete = 0";
$searchParams = [];
$paramTypes = "";

if ($search !== "") {
  $whereClause .= " AND (room_code LIKE ? OR building LIKE ?)";
  $searchParamLike = "%{$search}%";
  $searchParams = [$searchParamLike, $searchParamLike];
  $paramTypes = "ss";
}

$countSql = "SELECT COUNT(*) as total FROM tbl_room $whereClause";
$totalRecords = 0;

$stmtCount = $conn->prepare($countSql);
if (!empty($searchParams)) {
  $stmtCount->bind_param($paramTypes, ...$searchParams);
}
$stmtCount->execute();
$resultCount = $stmtCount->get_result();
$totalRecords = $resultCount->fetch_assoc()['total'];
$stmtCount->close();

$dataSql = "
    SELECT * FROM tbl_room
    $whereClause
    ORDER BY $sortBy $order
    LIMIT ? OFFSET ?
";

$rooms = [];
$finalParams = array_merge($searchParams, [$limit, $offset]);
$finalTypes = $paramTypes . "ii";

$stmtData = $conn->prepare($dataSql);
$stmtData->bind_param($finalTypes, ...$finalParams);
$stmtData->execute();
$resultData = $stmtData->get_result();

while ($row = $resultData->fetch_assoc()) {
  $rooms[] = $row;
}

$stmtData->close();
$conn->close();

echo json_encode([
  'data' => $rooms,
  'total_records' => $totalRecords
]);