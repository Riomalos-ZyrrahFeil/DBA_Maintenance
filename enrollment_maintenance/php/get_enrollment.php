<?php
session_start(); // Required to identify the logged-in user
ini_set('display_errors', 0);
error_reporting(E_ALL);

include '../../db.php';
header('Content-Type: application/json');

// Identify User Role and ID
$user_role = $_SESSION['role'] ?? '';
$student_session_id = $_SESSION['student_id'] ?? 0;

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

// 1. EDIT FETCH LOGIC (Filtered by role)
if (isset($_GET['id'])) {
    try {
        $id = intval($_GET['id']);
        $sql = "SELECT enrollment_id, student_id, enrollment_type, section_id, date_enrolled, status, letter_grade
                FROM tbl_enrollment
                WHERE enrollment_id = ? AND is_deleted = 0";
        
        // If student, they can only fetch their own ID
        if ($user_role === 'student') {
            $sql .= " AND student_id = " . intval($student_session_id);
        }

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_assoc();
        echo json_encode($data);
        $stmt->close();
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Fetch Error"]);
    }
    exit;
}

// 2. SEARCH, SORT, and PAGINATION
$search  = isset($_GET['search']) ? trim($conn->real_escape_string($_GET['search'])) : '';
$sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'enrollment_id';
$order   = (isset($_GET['order']) && strtolower($_GET['order']) === 'asc') ? 'ASC' : 'DESC'; 
$page    = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit   = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset  = ($page - 1) * $limit;

$columnMap = [
    'enrollment_id' => 'e.enrollment_id',
    'student_name' => 's.student_name',
    'section_code' => 'sec.section_code',
    'date_enrolled' => 'e.date_enrolled',
    'status' => 'e.status',
    'letter_grade' => 'e.letter_grade',
    'enrollment_type' => 'e.enrollment_type',
];
$sortColumn = $columnMap[$sort_by] ?? 'e.enrollment_id';

$joinClauses = "
    INNER JOIN tbl_student s ON e.student_id = s.student_id
    INNER JOIN tbl_section sec ON e.section_id = sec.section_id
";

// --- ROLE-BASED FILTERING ---
$whereClause = "WHERE e.is_deleted = 0";
if ($user_role === 'student') {
    $whereClause .= " AND e.student_id = " . intval($student_session_id);
}

if ($search !== '') {
    $searchLike = "%$search%";
    $whereClause .= " AND (s.student_name LIKE ? OR sec.section_code LIKE ? OR e.status LIKE ?)";
}

// 3. EXECUTION
try {
    // Count Total Records (Filtered by role)
    $countSql = "SELECT COUNT(*) as total FROM tbl_enrollment e $joinClauses $whereClause";
    $stmtCount = $conn->prepare($countSql);
    if ($search !== '') {
        $searchParams = [$searchLike, $searchLike, $searchLike];
        $stmtCount->bind_param("sss", ...$searchParams);
    }
    $stmtCount->execute();
    $totalRecords = $stmtCount->get_result()->fetch_assoc()['total'];
    $stmtCount->close();

    // Fetch Data (Filtered by role)
    $dataSql = "SELECT e.enrollment_id, s.student_name, e.student_id, sec.section_code, 
                       e.enrollment_type, e.date_enrolled, e.status, e.letter_grade
                FROM tbl_enrollment e
                $joinClauses $whereClause
                ORDER BY $sortColumn $order LIMIT ? OFFSET ?";

    $stmtData = $conn->prepare($dataSql);
    if ($search !== '') {
        $stmtData->bind_param("sssii", $searchLike, $searchLike, $searchLike, $limit, $offset);
    } else {
        $stmtData->bind_param("ii", $limit, $offset);
    }
    
    $stmtData->execute();
    $resultData = $stmtData->get_result();
    $enrollments = [];
    while ($row = $resultData->fetch_assoc()) {
        $enrollments[] = $row;
    }

    echo json_encode([
        'data' => $enrollments,
        'total_records' => $totalRecords
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>