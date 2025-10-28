package products

import (
	"context"

	"github.com/perekoshik/tg-market2/server/internal/db"
)

type Repository struct {
	db *db.Database
}

type ListFilter struct {
	Category string
	Limit    int
	Offset   int
}

func NewRepository(database *db.Database) *Repository {
	return &Repository{db: database}
}

func (r *Repository) List(ctx context.Context, filter ListFilter) ([]db.Product, int64, error) {
	var (
		products []db.Product
		total    int64
	)

	query := r.db.WithContext(ctx).Model(&db.Product{}).Where("is_active = ?", true)

	if filter.Category != "" {
		query = query.Where("category = ?", filter.Category)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	} else {
		query = query.Limit(20)
	}

	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}

	if err := query.Order("created_at DESC").Find(&products).Error; err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (r *Repository) Get(ctx context.Context, id uint) (*db.Product, error) {
	var product db.Product
	if err := r.db.WithContext(ctx).First(&product, "id = ? AND is_active = ?", id, true).Error; err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *Repository) Create(ctx context.Context, product *db.Product) error {
	return r.db.WithContext(ctx).Create(product).Error
}

func (r *Repository) Update(ctx context.Context, id uint, updates map[string]interface{}) error {
	return r.db.WithContext(ctx).Model(&db.Product{}).Where("id = ?", id).Updates(updates).Error
}

func (r *Repository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Model(&db.Product{}).Where("id = ?", id).Update("is_active", false).Error
}
