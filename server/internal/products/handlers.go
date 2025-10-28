package products

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/perekoshik/tg-market2/server/internal/db"
)

type Handler struct {
	repo      *Repository
	validator *validator.Validate
}

func NewHandler(repo *Repository) *Handler {
	v := validator.New()
	return &Handler{repo: repo, validator: v}
}

func (h *Handler) RegisterPublicRoutes(router gin.IRoutes) {
	router.GET("/products", h.list)
	router.GET("/products/:id", h.getByID)
}

func (h *Handler) RegisterProtectedRoutes(router gin.IRoutes) {
	router.POST("/products", h.create)
	router.PATCH("/products/:id", h.update)
	router.DELETE("/products/:id", h.delete)
}

func (h *Handler) list(c *gin.Context) {
	filter := ListFilter{}
	filter.Category = c.Query("category")

	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil {
			filter.Limit = limit
		}
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil {
			filter.Offset = offset
		}
	}

	items, total, err := h.repo.List(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"items": items,
		"total": total,
	})
}

func (h *Handler) getByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	product, err := h.repo.Get(c.Request.Context(), uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}

	c.JSON(http.StatusOK, product)
}

func (h *Handler) create(c *gin.Context) {
	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	if err := req.Validate(h.validator); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product := req.ToModel()

	if err := h.repo.Create(c.Request.Context(), product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, product)
}

func (h *Handler) update(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	if err := req.Validate(h.validator); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := req.ToUpdates()
	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "nothing to update"})
		return
	}

	if err := h.repo.Update(c.Request.Context(), uint(id), updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update product"})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *Handler) delete(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.repo.Delete(c.Request.Context(), uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete product"})
		return
	}

	c.Status(http.StatusNoContent)
}

// DTOs and validation

type CreateProductRequest struct {
	Title       string   `json:"title" validate:"required,max=80"`
	Description string   `json:"description" validate:"required,max=150"`
	Highlights  []string `json:"highlights" validate:"omitempty,max=4,dive,max=40"`
	PriceTON    float64  `json:"price_ton" validate:"required,gt=0"`
	Category    string   `json:"category" validate:"required,max=50"`
	Images      []string `json:"images" validate:"required,min=1,dive,url"`
	Stock       int      `json:"stock" validate:"gte=0"`
}

func (r *CreateProductRequest) Validate(v *validator.Validate) error {
	return v.Struct(r)
}

func (r *CreateProductRequest) ToModel() *db.Product {
	return &db.Product{
		SellerID:    0,
		Title:       r.Title,
		Description: r.Description,
		Highlights:  db.StringArray(r.Highlights),
		PriceTON:    r.PriceTON,
		Category:    r.Category,
		Images:      db.StringArray(r.Images),
		Stock:       r.Stock,
		IsActive:    true,
	}
}

type UpdateProductRequest struct {
	Title       *string   `json:"title" validate:"omitempty,max=80"`
	Description *string   `json:"description" validate:"omitempty,max=150"`
	Highlights  *[]string `json:"highlights" validate:"omitempty,max=4,dive,max=40"`
	PriceTON    *float64  `json:"price_ton" validate:"omitempty,gt=0"`
	Category    *string   `json:"category" validate:"omitempty,max=50"`
	Images      *[]string `json:"images" validate:"omitempty,min=1,dive,url"`
	Stock       *int      `json:"stock" validate:"omitempty,gte=0"`
	IsActive    *bool     `json:"is_active"`
}

func (r *UpdateProductRequest) Validate(v *validator.Validate) error {
	return v.Struct(r)
}

func (r *UpdateProductRequest) ToUpdates() map[string]interface{} {
	updates := make(map[string]interface{})

	if r.Title != nil {
		updates["title"] = *r.Title
	}
	if r.Description != nil {
		updates["description"] = *r.Description
	}
	if r.Highlights != nil {
		updates["highlights"] = db.StringArray(*r.Highlights)
	}
	if r.PriceTON != nil {
		updates["price_ton"] = *r.PriceTON
	}
	if r.Category != nil {
		updates["category"] = *r.Category
	}
	if r.Images != nil {
		updates["images"] = db.StringArray(*r.Images)
	}
	if r.Stock != nil {
		updates["stock"] = *r.Stock
	}
	if r.IsActive != nil {
		updates["is_active"] = *r.IsActive
	}

	return updates
}

