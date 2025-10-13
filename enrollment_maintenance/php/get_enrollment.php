<?php
include '../../db.php';
header('Content-Type: application/json');

// =================== GET ONE ENROLLMENT FOR EDIT ===================
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("
        SELECT enrollment_id, student_id, section_id, date_enrolled, status, letter_grade
        FROM tbl_enrollment
        WHERE enrollment_id = ? AND is_deleted = 0
    ");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_assoc();
    echo json_encode($data);
    $stmt->close();
    exit;
}

// =================== SEARCH & SORT ===================

// Get search and sort parameters
$search  = isset($_GET['search']) ? trim($conn->real_escape_string($_GET['search'])) : '';
$sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'enrollment_id';
$order   = (isset($_GET['order']) && strtolower($_GET['order']) === 'asc') ? 'ASC' : 'DESC';

// Whitelist of sortable columns to prevent SQL injection
$allowedSortColumns = ['enrollment_id', 'student_id', 'section_id', 'date_enrolled', 'status', 'letter_grade'];
if (!in_array($sort_by, $allowedSortColumns)) {
    $sort_by = 'enrollment_id';
}

// Base SQL (only active records)
$sql = "
    SELECT enrollment_id, student_id, section_id, date_enrolled, status, letter_grade
    FROM tbl_enrollment
    WHERE is_deleted = 0
";

// If search is not empty, add filter
if ($search !== '') {
    $searchLike = "%$search%";
    $sql .= " AND (student_id LIKE ? OR section_id LIKE ? OR status LIKE ? OR letter_grade LIKE ?)";
}

// Add sort order
$sql .= " ORDER BY $sort_by $order";

// Prepare and execute
if ($search !== '') {
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $searchLike, $searchLike, $searchLike, $searchLike);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query($sql);
}

// Fetch results
$enrollments = [];
while ($row = $result->fetch_assoc()) {
    $enrollments[] = $row;
}

// Return as JSON
echo json_encode($enrollments);
?>
