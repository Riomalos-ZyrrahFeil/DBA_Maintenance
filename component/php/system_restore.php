<?php
// component/php/system_restore.php
session_start();
include '../../db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_FILES['backup_file'])) {
    $sql_content = file_get_contents($_FILES['backup_file']['tmp_name']);

    // 1. Wrap the content with SET FOREIGN_KEY_CHECKS
    $full_sql = "SET FOREIGN_KEY_CHECKS = 0;\n" . $sql_content . "\nSET FOREIGN_KEY_CHECKS = 1;";

    // 2. Execute
    if ($conn->multi_query($full_sql)) {
        do {
            if ($result = $conn->store_result()) {
                $result->free();
            }
        } while ($conn->more_results() && $conn->next_result());

        // Use JSON for your AJAX handler in dashboard.php
        echo json_encode(["status" => "success", "message" => "Database restored successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
    exit;
}