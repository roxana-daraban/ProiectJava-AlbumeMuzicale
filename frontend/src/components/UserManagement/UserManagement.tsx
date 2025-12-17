import { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';
import './UserManagement.css';

/**
 * Componenta UserManagement - gestionare utilizatori (ADMIN only)
 */
const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getAllUsers();
      // Filtrează userii: exclude ADMIN-ul (user-ul curent) din listă
      const filteredUsers = data.filter((user) => {
        const userRole = normalizeRole(user.role);
        // Excludem user-ul curent (ADMIN-ul care gestionează)
        return user.id !== currentUser?.id && userRole !== 'ADMIN';
      });
      setUsers(filteredUsers);
    } catch (err: any) {
      setError(
        err.response?.status === 403
          ? 'Nu ai permisiunea de a vedea utilizatorii. Doar administratorii pot accesa această secțiune.'
          : 'Eroare la încărcarea utilizatorilor'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user: User) => {
    setEditingUser(user);
    setNewRole(user.role?.startsWith('ROLE_') ? user.role.substring(5) : user.role || 'USER');
  };

  const handleRoleSave = async () => {
    if (!editingUser || !newRole) return;

    try {
      setError('');
      await userService.updateUserRole(editingUser.id, newRole);
      await loadUsers();
      setEditingUser(null);
      setNewRole('');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Eroare la actualizarea rolului utilizatorului'
      );
    }
  };

  const handleRoleCancel = () => {
    setEditingUser(null);
    setNewRole('');
  };

  const handleDeleteClick = (userId: number) => {
    // Nu permitem ștergerea user-ului curent
    if (userId === currentUser?.id) {
      setError('Nu poți șterge propriul cont!');
      return;
    }
    setDeleteConfirm(userId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      setError('');
      await userService.deleteUser(deleteConfirm);
      await loadUsers();
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Eroare la ștergerea utilizatorului'
      );
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const normalizeRole = (role: string | undefined): string => {
    if (!role) return '';
    return role.startsWith('ROLE_') ? role.substring(5) : role;
  };

  const getRoleBadgeClass = (role: string): string => {
    const normalizedRole = normalizeRole(role);
    switch (normalizedRole) {
      case 'ADMIN':
        return 'role-badge admin';
      case 'EDITOR':
        return 'role-badge editor';
      case 'USER':
        return 'role-badge user';
      default:
        return 'role-badge';
    }
  };

  if (loading) {
    return <div className="loading">Se încarcă utilizatorii...</div>;
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>Gestionare Utilizatori</h2>
      </div>

      {error && (
        <div className="error" style={{ marginBottom: '1rem', position: 'relative' }}>
          {error}
          <button
            onClick={() => setError('')}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#dc3545',
              padding: '0 5px',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Modal pentru confirmare ștergere */}
      {deleteConfirm && (
        <div className="delete-modal-overlay" onClick={handleDeleteCancel}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmă ștergerea</h3>
            <p>Ești sigur că vrei să ștergi acest utilizator? Această acțiune nu poate fi anulată.</p>
            <div className="delete-modal-actions">
              <button className="btn-cancel" onClick={handleDeleteCancel}>
                Anulează
              </button>
              <button className="btn-delete" onClick={handleDeleteConfirm}>
                Șterge
              </button>
            </div>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <div className="no-users">Nu există utilizatori încă.</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Rol</th>
                <th>Status</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>
                    {editingUser?.id === user.id ? (
                      <div className="role-edit">
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="role-select"
                        >
                          <option value="USER">USER</option>
                          <option value="EDITOR">EDITOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <button
                          className="btn-save-role"
                          onClick={handleRoleSave}
                        >
                          ✓
                        </button>
                        <button
                          className="btn-cancel-role"
                          onClick={handleRoleCancel}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className={getRoleBadgeClass(user.role)}>
                        {normalizeRole(user.role)}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${user.enabled ? 'enabled' : 'disabled'}`}>
                      {user.enabled ? 'Activ' : 'Dezactivat'}
                    </span>
                  </td>
                  <td>
                    <div className="user-actions">
                      {editingUser?.id !== user.id && (
                        <button
                          className="btn-edit-role"
                          onClick={() => handleRoleChange(user)}
                        >
                          Schimbă Rol
                        </button>
                      )}
                      {user.id !== currentUser?.id && (
                        <button
                          className="btn-delete-user"
                          onClick={() => handleDeleteClick(user.id)}
                        >
                          Șterge
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

