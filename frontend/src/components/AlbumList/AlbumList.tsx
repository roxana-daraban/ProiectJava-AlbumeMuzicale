import { useEffect, useState } from 'react';
import { albumService } from '../../services/albumService';
import { useAuth } from '../../context/AuthContext';
import type { Album } from '../../types';
import AlbumForm from '../AlbumForm/AlbumForm';
import './AlbumList.css';

/**
 * Componenta AlbumList - afișează lista de albume cu opțiuni de creare, editare și ștergere
 */
type SortField = 'title' | 'artist' | 'year';
type SortDirection = 'asc' | 'desc';

const AlbumList = () => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [sortedAlbums, setSortedAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await albumService.getAllAlbums();
      setAlbums(data);
    } catch (err) {
      setError('Eroare la încărcarea albumelor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Efect pentru sortare când se schimbă albums, sortField sau sortDirection
  useEffect(() => {
    const sorted = [...albums].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '', 'ro');
          break;
        case 'artist':
          comparison = (a.artist || '').localeCompare(b.artist || '', 'ro');
          break;
        case 'year':
          const yearA = a.releaseYear || 0;
          const yearB = b.releaseYear || 0;
          comparison = yearA - yearB;
          break;
        default:
          return 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
    setSortedAlbums(sorted);
  }, [albums, sortField, sortDirection]);

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      // Dacă click pe același field, schimbăm direcția
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Dacă click pe alt field, setăm noul field cu direcție ascendentă
      setSortField(field);
      setSortDirection('asc');
    }
  };

  /**
   * Normalizează rolul eliminând prefixul "ROLE_" dacă există
   */
  const normalizeRole = (role: string | undefined): string => {
    if (!role) return '';
    return role.startsWith('ROLE_') ? role.substring(5) : role;
  };

  /**
   * Verifică dacă user-ul are un rol specific
   */
  const hasRole = (targetRole: string): boolean => {
    const userRole = normalizeRole(user?.role);
    return userRole === targetRole;
  };

  // Verifică dacă user-ul poate crea albume (USER, EDITOR sau ADMIN)
  // Notă: USER are voie să creeze primul album, după care devine EDITOR automat (logica în backend)
  const canCreate = () => {
    return hasRole('USER') || hasRole('EDITOR') || hasRole('ADMIN');
  };

  // Verifică dacă user-ul poate edita/șterge un album specific
  // ADMIN poate modifica orice album
  // EDITOR poate modifica doar propriile albume (verificarea se face în backend)
  const canModify = (album: Album) => {
    if (hasRole('ADMIN')) {
      return true; // ADMIN poate modifica orice
    }
    if (hasRole('EDITOR')) {
      // EDITOR - verificăm ownership-ul: doar dacă albumul aparține user-ului curent
      // Verificarea exactă se face și în backend pentru securitate
      if (user?.id && album.userId && user.id === album.userId) {
        return true; // Albumul aparține user-ului curent
      }
      return false; // Albumul nu aparține user-ului curent
    }
    return false;
  };

  const handleCreateClick = () => {
    setEditingAlbum(null);
    setShowForm(true);
  };

  const handleEditClick = (album: Album) => {
    setEditingAlbum(album);
    setShowForm(true);
  };

  const handleDeleteClick = (albumId: number) => {
    setDeleteConfirm(albumId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      setError(''); // Ștergem erori anterioare
      await albumService.deleteAlbum(deleteConfirm);
      // Reîncărcăm lista după ștergere
      await loadAlbums();
      setDeleteConfirm(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
        err.response?.status === 403 
          ? 'Nu ai permisiunea să ștergi acest album. Doar proprietarul sau administratorul pot șterge albume.'
          : 'Eroare la ștergerea albumului. Poate albumul nu există.';
      setError(errorMessage);
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAlbum(null);
    setError(''); // Ștergem erori când închidem formularul
  };

  const handleFormSuccess = () => {
    loadAlbums();
  };

  if (loading) {
    return <div className="loading">Se încarcă albumele...</div>;
  }

  return (
    <div className="album-list">
      <div className="album-list-header">
        <h2>Albume Muzicale</h2>
        <div className="header-actions">
          {/* Butoane de sortare */}
          <div className="sort-buttons">
            <span className="sort-label">Sortează:</span>
            <button
              className={`sort-btn ${sortField === 'title' ? 'active' : ''}`}
              onClick={() => handleSortChange('title')}
            >
              Titlu {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              className={`sort-btn ${sortField === 'artist' ? 'active' : ''}`}
              onClick={() => handleSortChange('artist')}
            >
              Artist {sortField === 'artist' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              className={`sort-btn ${sortField === 'year' ? 'active' : ''}`}
              onClick={() => handleSortChange('year')}
            >
              An {sortField === 'year' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
          {canCreate() && (
            <button className="btn-create" onClick={handleCreateClick}>
              + Creează Album
            </button>
          )}
        </div>
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
              padding: '0 5px'
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
            <p>Ești sigur că vrei să ștergi acest album? Această acțiune nu poate fi anulată.</p>
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

      {/* Formular pentru creare/editare */}
      {showForm && (
        <AlbumForm
          album={editingAlbum}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {albums.length === 0 ? (
        <div className="no-albums">
          Nu există albume încă.
          {canCreate() && (
            <div>
              <button className="btn-create-inline" onClick={handleCreateClick}>
                Creează primul album
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="albums-grid">
          {sortedAlbums.map((album) => (
            <div key={album.id} className="album-card">
              {album.imageUrl && (
                <img
                  src={album.imageUrl}
                  alt={`${album.title} - ${album.artist}`}
                  className="album-image"
                  onError={(e) => {
                    // Dacă imaginea nu se încarcă, ascunde-o
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="album-info">
                <h3 className="album-title">{album.title}</h3>
                <p className="album-artist">{album.artist}</p>
                {album.genre && <p className="album-genre">{album.genre}</p>}
                {album.releaseYear && (
                  <p className="album-year">An: {album.releaseYear}</p>
                )}
                {album.recordLabel && (
                  <p className="album-label">Casă de Discuri: {album.recordLabel}</p>
                )}
                {album.price && (
                  <p className="album-price">Preț: {album.price} RON</p>
                )}
                {album.stock !== undefined && (
                  <p className="album-stock">Stoc: {album.stock}</p>
                )}

                {/* Butoane de acțiune pentru EDITOR și ADMIN */}
                {canModify(album) && (
                  <div className="album-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditClick(album)}
                    >
                      Editează
                    </button>
                    <button
                      className="btn-delete-small"
                      onClick={() => album.id && handleDeleteClick(album.id)}
                    >
                      Șterge
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumList;