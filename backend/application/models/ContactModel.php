<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class ContactModel {
    private PDO $db;

    public function __construct() {
        require_once APPPATH . 'config/database.php';

        $config = $db['default'];
        $dsn = 'mysql:host=' . $config['hostname'] . ';dbname=' . $config['database'] . ';charset=utf8mb4';
        $this->db = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        $this->createTable();
    }

    private function createTable(): void {
        $sql = "CREATE TABLE IF NOT EXISTS contacts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            phone VARCHAR(20) NOT NULL,
            image VARCHAR(255) DEFAULT NULL,
            dob DATE NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
        $this->db->exec($sql);
    }

    public function findAll(): array {
        $stmt = $this->db->query("SELECT * FROM contacts ORDER BY created_at DESC");
        return $stmt->fetchAll();
    }

    public function findById(int $id): array|false {
        $stmt = $this->db->prepare("SELECT * FROM contacts WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function findByEmail(string $email, ?int $excludeId = null): array|false {
        if ($excludeId) {
            $stmt = $this->db->prepare("SELECT * FROM contacts WHERE email = ? AND id != ?");
            $stmt->execute([$email, $excludeId]);
        } else {
            $stmt = $this->db->prepare("SELECT * FROM contacts WHERE email = ?");
            $stmt->execute([$email]);
        }
        return $stmt->fetch();
    }

    public function create(array $data): int {
        $stmt = $this->db->prepare(
            "INSERT INTO contacts (name, email, phone, image, dob, message)
             VALUES (:name, :email, :phone, :image, :dob, :message)"
        );
        $stmt->execute($data);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $data['id'] = $id;
        $stmt = $this->db->prepare(
            "UPDATE contacts SET name=:name, email=:email, phone=:phone,
             image=:image, dob=:dob, message=:message WHERE id=:id"
        );
        return $stmt->execute($data);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM contacts WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
