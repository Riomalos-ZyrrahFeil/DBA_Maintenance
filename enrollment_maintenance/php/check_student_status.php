<?php
include '../../db.php';

function getStudentStatus($conn, $student_id) {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM tbl_enrollment WHERE student_id = ? AND letter_grade IN ('D', 'F', 'INC') AND is_deleted = 0");
    $stmt->bind_param("i", $student_id);
    $stmt->execute();
    $failed_count = $stmt->get_result()->fetch_row()[0];

    return ($failed_count > 0) ? 'Irregular' : 'Regular';
}
?>