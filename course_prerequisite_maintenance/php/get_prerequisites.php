<?php
include '../../db.php';
header('Content-Type: application/json');

$course_id = isset($_GET['course_id']) ? $_GET['course_id'] : null;

try {
    if ($course_id) {
        // ✅ Get prerequisites for a specific course (excluding deleted)
        $stmt = $conn->prepare("
            SELECT 
                cp.prerequisite_id,
                cp.course_id,
                cp.prereq_course_id,
                c1.course_code AS course_code,
                c1.title AS course_title,
                c2.course_code AS prerequisite_code,
                c2.title AS prerequisite_title
            FROM tbl_course_prerequisite cp
            INNER JOIN tbl_course c1 ON cp.course_id = c1.course_id
            INNER JOIN tbl_course c2 ON cp.prereq_course_id = c2.course_id
            WHERE cp.course_id = ? 
              AND c1.is_deleted = 0 
              AND c2.is_deleted = 0 
              AND cp.is_deleted = 0 /* NEW: Filter out soft-deleted prerequisites */
            ORDER BY cp.prerequisite_id DESC
        ");
        $stmt->bind_param("i", $course_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $prerequisites = [];
        while ($row = $result->fetch_assoc()) {
            $prerequisites[] = $row;
        }

        echo json_encode($prerequisites);
        $stmt->close();
    } else {
        // ✅ Get all prerequisites (excluding deleted)
        $query = "
            SELECT 
                cp.prerequisite_id,
                cp.course_id,
                cp.prereq_course_id,
                c1.course_code AS course_code,
                c1.title AS course_title,
                c2.course_code AS prerequisite_code,
                c2.title AS prerequisite_title
            FROM tbl_course_prerequisite cp
            INNER JOIN tbl_course c1 ON cp.course_id = c1.course_id
            INNER JOIN tbl_course c2 ON cp.prereq_course_id = c2.course_id
            WHERE c1.is_deleted = 0 
              AND c2.is_deleted = 0 
              AND cp.is_deleted = 0 /* NEW: Filter out soft-deleted prerequisites */
            ORDER BY cp.prerequisite_id DESC
        ";

        $result = $conn->query($query);
        $prerequisites = [];

        while ($row = $result->fetch_assoc()) {
            $prerequisites[] = $row;
        }

        echo json_encode($prerequisites);
    }
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Server error: " . $e->getMessage()
    ]);
}
?>