import { useState, useEffect } from 'react';
import { albumService } from '../../services/albumService';
import type { Album } from '../../types';
import './AlbumForm.css';

interface AlbumFormProps {
  album?: Album | null; // Album existent pentru editare, null pentru creare
  onClose: () => void; // Funcție pentru închiderea formularului
  onSuccess: () => void; // Callback după succes (refresh lista)
}

/**
 * Componenta AlbumForm - formular pentru crearea și editarea albumelor
 * 
 * Props:
 * - album: Albumul existent (dacă e editare) sau null (dacă e creare)
 * - onClose: Funcție apelată când se închide formularul
 * - onSuccess: Funcție apelată după succes (pentru refresh)
 */
const AlbumForm = ({ album, onClose, onSuccess }: AlbumFormProps) => {
  // Stare pentru datele formularului
  const [formData, setFormData] = useState<Omit<Album, 'id'>>({
    title: '',
    artist: '',
    genre: '',
    releaseYear: undefined,
    recordLabel: '',
    price: undefined,
    stock: undefined,
    imageUrl: '',
  });

  // Stare pentru erori și loading
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Dacă e editare, populează formularul cu datele albumului
  useEffect(() => {
    if (album) {
      setFormData({
        title: album.title || '',
        artist: album.artist || '',
        genre: album.genre || '',
        releaseYear: album.releaseYear,
        recordLabel: album.recordLabel || '',
        price: album.price,
        stock: album.stock,
        imageUrl: album.imageUrl || '',
      });
    }
  }, [album]);

  // Gestionarea schimbărilor în inputuri
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Pentru câmpurile numerice, convertim la number sau undefined
    if (name === 'releaseYear' || name === 'price' || name === 'stock') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Ștergem eroarea când user-ul începe să scrie
    if (error) {
      setError('');
    }
  };

  // Submit formular
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validare de bază
      if (!formData.title.trim() || !formData.artist.trim()) {
        setError('Titlul și artistul sunt obligatorii!');
        setLoading(false);
        return;
      }

      if (album && album.id) {
        // EDITARE: actualizăm albumul existent
        await albumService.updateAlbum(album.id, formData);
      } else {
        // CREARE: creăm album nou
        await albumService.createAlbum(formData);
      }

      // Succes: închidem formularul și reîncărcăm lista
      onSuccess();
      onClose();
    } catch (err: any) {
      // Gestionăm erorile
      setError(
        err.response?.data?.message || 
        'Eroare la salvarea albumului. Te rog încearcă din nou.'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="album-form-overlay" onClick={onClose}>
      <div className="album-form-container" onClick={(e) => e.stopPropagation()}>
        <div className="album-form-header">
          <h2>{album ? 'Editează Album' : 'Creează Album Nou'}</h2>
          <button className="close-button" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="album-form">
          {error && <div className="form-error">{error}</div>}

          {/* Titlu - obligatoriu */}
          <div className="form-group">
            <label htmlFor="title">
              Titlu <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Artist - obligatoriu */}
          <div className="form-group">
            <label htmlFor="artist">
              Artist <span className="required">*</span>
            </label>
            <input
              type="text"
              id="artist"
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {/* Genre - opțional */}
          <div className="form-group">
            <label htmlFor="genre">Gen Muzical</label>
            <input
              type="text"
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Release Year - opțional */}
          <div className="form-group">
            <label htmlFor="releaseYear">Anul Lansării</label>
            <input
              type="number"
              id="releaseYear"
              name="releaseYear"
              value={formData.releaseYear || ''}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear()}
              disabled={loading}
            />
          </div>

          {/* Record Label - opțional */}
          <div className="form-group">
            <label htmlFor="recordLabel">Casă de Discuri</label>
            <input
              type="text"
              id="recordLabel"
              name="recordLabel"
              value={formData.recordLabel}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Price - opțional */}
          <div className="form-group">
            <label htmlFor="price">Preț (RON)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>

          {/* Stock - opțional */}
          <div className="form-group">
            <label htmlFor="stock">Stoc</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock || ''}
              onChange={handleChange}
              min="0"
              disabled={loading}
            />
          </div>

          {/* Image URL - opțional */}
          <div className="form-group">
            <label htmlFor="imageUrl">URL Imagine</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              disabled={loading}
            />
          </div>

          {/* Butoane */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={loading}
            >
              Anulează
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Se salvează...' : album ? 'Actualizează' : 'Creează'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlbumForm;

