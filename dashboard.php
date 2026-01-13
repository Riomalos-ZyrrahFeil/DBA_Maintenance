<?php
session_start();
include './db.php';

if (!isset($_SESSION['user_id'])) {
  header("Location: index.php");
  exit();
}

$user_role = $_SESSION['role'] ?? 'student';
$ref_id = $_SESSION['ref_id'] ?? 0;
$display_name = "";

if ($user_role === 'student') {
  $stmt = $conn->prepare("SELECT COUNT(*) FROM tbl_enrollment WHERE student_id = ? AND is_deleted = 0");
  $stmt->bind_param("i", $ref_id);
  $stmt->execute();
  $my_enrollments = $stmt->get_result()->fetch_row()[0];

  $stmt = $conn->prepare("SELECT student_name FROM tbl_student WHERE student_id = ?");
  $stmt->bind_param("i", $ref_id);
  $stmt->execute();
  $display_name = $stmt->get_result()->fetch_assoc()['student_name'] ?? 'Student';
} 
else if ($user_role === 'faculty') {
  $stmt = $conn->prepare("SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM tbl_instructor WHERE instructor_id = ?");
  $stmt->bind_param("i", $ref_id);
  $stmt->execute();
  $display_name = $stmt->get_result()->fetch_assoc()['full_name'] ?? 'Faculty Member';
} 
else {
  $display_name = 'System Administrator';
}

if ($user_role !== 'student') {
  $total_students = $conn->query("SELECT COUNT(*) FROM tbl_student WHERE is_deleted = 0")->fetch_row()[0];
  $total_enrollments = $conn->query("SELECT COUNT(*) FROM tbl_enrollment WHERE is_deleted = 0")->fetch_row()[0];
  $total_sections = $conn->query("SELECT COUNT(*) FROM tbl_section WHERE is_deleted = 0")->fetch_row()[0];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dashboard - PUP Maintenance</title>
  <link rel="stylesheet" href="dashboard.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
  <div class="dash-main-wrapper">
    <?php include('component/sidebar.php'); ?>

    <main class="main-content">
      <header style="margin-bottom: 2rem;">
          <h1>Welcome, <?php echo $display_name; ?></h1>
          <p>Role: <strong><?php echo ucwords(str_replace('_', ' ', $user_role)); ?></strong></p>
      </header>
      
      <div class="stat-grid">
          <?php if ($user_role === 'student'): ?>
              <div class="stat-card">
                  <h3>My Enrolled Subjects</h3>
                  <p class="number"><?php echo $my_enrollments; ?></p>
              </div>
              <div class="stat-card">
                  <h3>Current Status</h3>
                  <p class="number" style="font-size: 1.8rem;">Regular</p>
              </div>
          <?php else: ?>
              <div class="stat-card">
                  <h3>Total Students</h3>
                  <p class="number"><?php echo number_format($total_students); ?></p>
              </div>
              <div class="stat-card">
                  <h3>Active Enrollments</h3>
                  <p class="number"><?php echo number_format($total_enrollments); ?></p>
              </div>
              <div class="stat-card">
                  <h3>Current Sections</h3>
                  <p class="number"><?php echo number_format($total_sections); ?></p>
              </div>
          <?php endif; ?>
      </div>

      <?php if ($user_role === 'super_admin' || $user_role === 'admin'): ?>
      <div class="admin-utilities card" style="margin-top: 2rem; padding: 1.5rem; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2><i class="fas fa-tools"></i> System Maintenance Tools</h2>
          <hr style="margin: 1rem 0; border: 0; border-top: 1px solid #eee;">
          <div class="util-buttons" style="display: flex; gap: 1rem;">
              <button onclick="triggerBackup()" class="primary-btn" style="padding: 10px 20px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px;">
                  <i class="fas fa-download"></i> Generate & Download Backup (.sql)
              </button>
              
              <button onclick="document.getElementById('restoreFile').click()" class="secondary-btn" style="padding: 10px 20px; cursor: pointer; background: #6c757d; color: white; border: none; border-radius: 4px;">
                  <i class="fas fa-upload"></i> Upload & Restore Database
              </button>
              
              <form id="restoreForm" enctype="multipart/form-data" style="display:none">
                <input type="file" id="restoreFile" name="backup_file" accept=".sql" onchange="handleRestore(this)">
              </form>
          </div>
          <p style="font-size: 0.85rem; color: #dc3545; margin-top: 1rem;">
              <strong>Note:</strong> Restoring will permanently overwrite all current data.
          </p>
      </div>
      <?php endif; ?>
    </main>
  </div>

  <script>
    function triggerBackup() {
      if(confirm("Generate a full database backup and download it now?")) {
        window.location.href = 'component/php/system_backup.php';
      }
    }

    async function handleRestore(input) {
      if (!input.files.length) return;
      
      const file = input.files[0];
      if (!file.name.endsWith('.sql')) {
          alert("Please upload a valid .sql file.");
          return;
      }

      if(confirm("WARNING: This will DELETE all current data and restore from the file. This action cannot be undone. Proceed?")) {
        const formData = new FormData();
        formData.append('backup_file', file);

        try {
            const resp = await fetch('component/php/system_restore.php', {
              method: 'POST',
              body: formData
            });

            if (resp.ok) {
                alert("Database restoration completed!");
                location.reload();
            } else {
                alert("Error during restoration. Please check file integrity.");
            }
        } catch (error) {
            console.error("Restore failed:", error);
            alert("An error occurred while connecting to the server.");
        }
      }
      input.value = '';
    }
  </script>
</body>
</html>