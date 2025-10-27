<?php
include '../../db.php';
header('Content-Type: application/json');

// Get parameters safely
$search = isset($_GET['search']) ? trim($conn->real_escape_string($_GET['search'])) : '';
$sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'course_id';
$order = isset($_GET['order']) && strtolower($_GET['order']) === 'asc' ? 'ASC' : 'DESC';
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = ($page - 1) * $limit;

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

$valid_columns = ['course_id', 'course_code', 'title', 'lecture_hours', 'lab_hours', 'units'];
if (!in_array($sort_by, $valid_columns)) {
    $sort_by = 'course_id';
}

// ✅ Fetch single course by ID
if ($id > 0) {
    $stmt = $conn->prepare("
        SELECT * FROM tbl_course 
        WHERE course_id = ? 
          AND is_deleted = 0
        LIMIT 1
    ");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $course = $result->fetch_assoc();

    echo json_encode($course ?: []);
    exit;
}

$whereClause = "WHERE is_deleted = 0 AND (course_code LIKE ? OR title LIKE ?)";
$searchParam = "%{$search}%";
$searchParams = [$searchParam, $searchParam];
$paramTypes = "ss";

$countSql = "SELECT COUNT(*) as total FROM tbl_course $whereClause";
$totalRecords = 0;

$stmtCount = $conn->prepare($countSql);
$stmtCount->bind_param($paramTypes, ...$searchParams);
$stmtCount->execute();
$resultCount = $stmtCount->get_result();
$totalRecords = $resultCount->fetch_assoc()['total'];
$stmtCount->close();

$dataSql = "
    SELECT * FROM tbl_course 
    $whereClause
    ORDER BY $sort_by $order
    LIMIT ? OFFSET ?
";

$courses = [];
$finalParams = array_merge($searchParams, [$limit, $offset]);
$finalTypes = $paramTypes . "ii";

$stmtData = $conn->prepare($dataSql);
$stmtData->bind_param($finalTypes, ...$finalParams);
$stmtData->execute();
$resultData = $stmtData->get_result();

while ($row = $resultData->fetch_assoc()) {
    $courses[] = $row;
}
$stmtData->close();

echo json_encode([
    'data' => $courses,
    'total_records' => $totalRecords
]);
?>