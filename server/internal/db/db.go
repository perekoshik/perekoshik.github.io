package db

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Database struct {
	*gorm.DB
}

func New(databaseURL string) (*Database, error) {
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	}

	database, err := gorm.Open(postgres.Open(databaseURL), gormConfig)
	if err != nil {
		return nil, err
	}

	if err := database.AutoMigrate(&Product{}); err != nil {
		return nil, err
	}

	return &Database{DB: database}, nil
}

func (db *Database) Close() error {
	sqlDB, err := db.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

type StringArray []string

func (s StringArray) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *StringArray) Scan(value interface{}) error {
	if value == nil {
		*s = StringArray{}
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("failed to parse StringArray from database")
	}

	return json.Unmarshal(bytes, s)
}

type Product struct {
	ID          uint        `gorm:"primaryKey" json:"id"`
	SellerID    int         `gorm:"column:seller_id" json:"seller_id"`
	Title       string      `gorm:"size:80" json:"title"`
	Description string      `gorm:"size:150" json:"description"`
	Highlights  StringArray `gorm:"type:jsonb" json:"highlights"`
	PriceTON    float64     `gorm:"type:numeric(18,6);column:price_ton" json:"price_ton"`
	Category    string      `gorm:"size:50" json:"category"`
	Images      StringArray `gorm:"type:jsonb" json:"images"`
	Stock       int         `json:"stock"`
	IsActive    bool        `gorm:"default:true;column:is_active" json:"is_active"`
	CreatedAt   time.Time   `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time   `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

func (Product) TableName() string {
	return "products"
}
