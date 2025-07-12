# Grocy Technical Specification

## Overview
Grocy is a web-based self-hosted ERP system for groceries and household management. It provides comprehensive features for managing household inventory, shopping lists, recipes, chores, tasks, batteries, and equipment.

**Current Version**: 4.5.0
**Release Date**: 2025-03-28

## Architecture

### Technology Stack
- **Backend**: PHP 8.2+ with Slim Framework 4.x
- **Frontend**: JavaScript/HTML with Bootstrap 4.x, jQuery 3.x, and Blade templating
- **Database**: SQLite 3.34.0+
- **Authentication**: Multiple options (default, reverse proxy, LDAP)
- **Packaging**: Composer (PHP dependencies), Yarn (JavaScript dependencies)

### Application Structure
```
grocy/
├── app.php                 # Main application bootstrap
├── routes.php              # API and web routes
├── controllers/            # MVC controllers
├── services/              # Business logic services
├── middleware/            # Authentication and request processing
├── helpers/               # Utility functions
├── views/                 # Blade templates
├── public/                # Static assets and entry point
├── migrations/            # Database schema migrations
├── localization/          # Multi-language support
├── data/                  # Application data directory
└── packages/              # Composer dependencies
```

## Core Features

### 1. Stock Management
- **Product Management**: Complete product catalog with barcodes, locations, quantities
- **Inventory Tracking**: Real-time stock levels, expiration dates, purchase history
- **Location Management**: Multiple storage locations with hierarchical organization
- **Quantity Unit Conversions**: Flexible unit conversion system
- **Price Tracking**: Historical price tracking across shopping locations
- **Barcode Support**: Internal grocycodes and external barcode lookup
- **Tare Weight Handling**: Support for container weights

### 2. Shopping List Management
- **Multiple Lists**: Support for multiple shopping lists
- **Auto-population**: Automatic addition of missing/expired/overdue products
- **Shopping Locations**: Track where products are purchased
- **Price Integration**: Integration with stock price tracking
- **Print Support**: Thermal and regular printer support

### 3. Recipe Management
- **Recipe Database**: Comprehensive recipe storage with ingredients and instructions
- **Meal Planning**: Calendar-based meal planning with serving calculations
- **Recipe Nesting**: Support for sub-recipes and ingredient scaling
- **Stock Integration**: Automatic checking of ingredient availability
- **Nutritional Information**: Calorie tracking and nutritional data

### 4. Chore Management
- **Chore Tracking**: Recurring household tasks with scheduling
- **Assignment System**: Multi-user chore assignment
- **Frequency Management**: Flexible scheduling (daily, weekly, monthly, etc.)
- **Execution Tracking**: History of chore completions

### 5. Task Management
- **Task Categories**: Organized task management with categories
- **Due Date Tracking**: Task scheduling with due date notifications
- **Priority System**: Task prioritization and sorting

### 6. Battery Management
- **Battery Inventory**: Track rechargeable battery inventory
- **Charge Cycle Tracking**: Monitor battery usage and charging cycles
- **Due Date Notifications**: Alerts for battery maintenance

### 7. Equipment Management
- **Equipment Database**: Inventory of household equipment
- **Maintenance Tracking**: Equipment maintenance schedules
- **Manual Storage**: Equipment manuals and documentation

### 8. Calendar Integration
- **Unified Calendar**: Combined view of all due dates and events
- **Export Support**: iCal export for external calendar integration
- **Color Coding**: Visual distinction between different event types

## Data Structures

### Core Database Tables

#### Products
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location_id INTEGER,
    qu_id_purchase INTEGER,
    qu_id_stock INTEGER,
    qu_id_consume INTEGER,
    qu_id_price INTEGER,
    min_stock_amount INTEGER,
    default_best_before_days INTEGER,
    product_group_id INTEGER,
    barcode TEXT,
    -- Additional fields for advanced features
    enable_tare_weight_handling BOOLEAN,
    tare_weight REAL,
    calories INTEGER,
    -- Timestamps
    row_created_timestamp DATETIME,
    row_updated_timestamp DATETIME
);
```

#### Stock Management
```sql
CREATE TABLE stock (
    id INTEGER PRIMARY KEY,
    product_id INTEGER,
    amount REAL,
    best_before_date DATE,
    purchased_date DATE,
    stock_id TEXT,
    price REAL,
    location_id INTEGER,
    opened_date DATE,
    note TEXT
);

CREATE TABLE stock_log (
    id INTEGER PRIMARY KEY,
    product_id INTEGER,
    amount REAL,
    best_before_date DATE,
    purchased_date DATE,
    used_date DATE,
    spoiled BOOLEAN,
    stock_id TEXT,
    transaction_type TEXT,
    price REAL,
    transaction_id TEXT,
    user_id INTEGER,
    location_id INTEGER,
    recipe_id INTEGER,
    note TEXT
);
```

#### Recipes
```sql
CREATE TABLE recipes (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    picture_file_name TEXT,
    base_servings INTEGER,
    desired_servings INTEGER,
    not_check_shoppinglist BOOLEAN,
    type TEXT,
    product_id INTEGER
);

CREATE TABLE recipes_pos (
    id INTEGER PRIMARY KEY,
    recipe_id INTEGER,
    product_id INTEGER,
    amount REAL,
    note TEXT,
    qu_id INTEGER,
    only_check_single_unit_in_stock BOOLEAN,
    ingredient_group TEXT,
    not_check_stock_fulfillment BOOLEAN,
    variable_amount TEXT,
    price_factor REAL
);
```

#### Shopping Lists
```sql
CREATE TABLE shopping_list (
    id INTEGER PRIMARY KEY,
    product_id INTEGER,
    amount REAL,
    note TEXT,
    qu_id INTEGER,
    done BOOLEAN,
    shopping_list_id INTEGER
);

CREATE TABLE shopping_lists (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);
```

#### Locations and Quantity Units
```sql
CREATE TABLE locations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_freezer BOOLEAN
);

CREATE TABLE quantity_units (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    name_plural TEXT,
    description TEXT,
    plural_forms TEXT
);

CREATE TABLE quantity_unit_conversions (
    id INTEGER PRIMARY KEY,
    from_qu_id INTEGER,
    to_qu_id INTEGER,
    factor REAL,
    product_id INTEGER
);
```

#### Chores and Tasks
```sql
CREATE TABLE chores (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    period_type TEXT,
    period_config TEXT,
    period_days INTEGER,
    track_date_only BOOLEAN,
    rollover BOOLEAN,
    assignment_type TEXT,
    assignment_config TEXT,
    next_estimated_execution_time DATETIME,
    consume_product_on_execution BOOLEAN,
    product_id INTEGER,
    product_amount REAL
);

CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    done BOOLEAN,
    done_timestamp DATETIME,
    category_id INTEGER,
    assigned_to_user_id INTEGER
);
```

### Complex Views and Calculations

#### Stock Current View
The application uses sophisticated views to calculate current stock levels:
```sql
CREATE VIEW stock_current AS
SELECT 
    product_id,
    SUM(amount) as amount_aggregated,
    MIN(best_before_date) as best_before_date,
    -- Complex aggregations for stock management
FROM stock
GROUP BY product_id;
```

#### Recipe Resolution
Complex view for recipe ingredient fulfillment:
```sql
CREATE VIEW recipes_pos_resolved AS
SELECT 
    r.id AS recipe_id,
    rp.product_id,
    -- Complex calculations for serving adjustments
    CASE WHEN recipe_fulfillment_logic THEN ... END as need_fulfilled,
    -- Price and nutritional calculations
FROM recipes r
JOIN recipes_pos rp ON r.id = rp.recipe_id
-- Multiple joins for stock, shopping list, pricing
```

## API Architecture

### REST API Design
- **Base Path**: `/api/`
- **Authentication**: API Key based (header: `GROCY-API-KEY`)
- **Content Type**: JSON
- **Error Handling**: Standardized error responses
- **OpenAPI Specification**: Comprehensive API documentation

### Key API Endpoints

#### Stock Management
- `GET /api/stock` - Current stock overview
- `POST /api/stock/products/{id}/add` - Add product to stock
- `POST /api/stock/products/{id}/consume` - Consume product from stock
- `POST /api/stock/products/{id}/transfer` - Transfer product between locations
- `POST /api/stock/products/{id}/inventory` - Inventory correction

#### Shopping Lists
- `GET /api/objects/shopping_list` - Get shopping list items
- `POST /api/stock/shoppinglist/add-missing-products` - Auto-add missing products
- `POST /api/stock/shoppinglist/clear` - Clear shopping list

#### Recipes
- `GET /api/objects/recipes` - Get recipes
- `GET /api/recipes/{id}/fulfillment` - Check recipe fulfillment
- `POST /api/recipes/{id}/consume` - Consume recipe ingredients

#### Generic Entity Management
- `GET /api/objects/{entity}` - Get entity objects
- `POST /api/objects/{entity}` - Create entity object
- `PUT /api/objects/{entity}/{id}` - Update entity object
- `DELETE /api/objects/{entity}/{id}` - Delete entity object

## Advanced Features

### Barcode System
- **Internal Grocycodes**: Custom barcode generation (DataMatrix/Code128)
- **External Lookup**: Plugin-based barcode lookup (OpenFoodFacts integration)
- **Camera Scanning**: Browser-based barcode scanning using ZXing library
- **Label Printing**: Integration with label printers via webhooks

### User Management
- **Multi-user Support**: User accounts with individual settings
- **Permission System**: Granular permission control
- **User Settings**: Customizable user preferences
- **Authentication Methods**: Default, reverse proxy, LDAP support

### Internationalization
- **Multi-language Support**: Full localization support
- **Date/Time Formatting**: Locale-aware formatting
- **Currency Support**: Configurable currency display
- **Translation Management**: Transifex integration

### Data Import/Export
- **Database Migrations**: Versioned schema migrations
- **Backup System**: Automated backup functionality
- **API Integration**: Full REST API for external integration
- **CSV Support**: Import/export capabilities

### Performance Optimization
- **Database Caching**: Cached views for complex calculations
- **Query Optimization**: Efficient database queries
- **Asset Optimization**: Minified CSS/JS assets
- **Lazy Loading**: Deferred loading of non-critical components

## Security Features

### Authentication & Authorization
- **Secure Authentication**: Multiple authentication methods
- **API Key Management**: Secure API key generation and management
- **Session Management**: Secure session handling
- **Permission System**: Role-based access control

### Data Protection
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Output encoding and CSP headers
- **CSRF Protection**: Request validation tokens

### Privacy
- **Self-hosted**: Complete data control
- **No External Dependencies**: Optional external service integration
- **Data Encryption**: Secure data storage
- **Audit Logging**: Comprehensive activity logging

## Configuration Management

### Environment Configuration
- **Feature Flags**: Granular feature control
- **Environment Variables**: Configurable via environment
- **File Overrides**: Setting override capabilities
- **Default Settings**: Comprehensive default configuration

### User Preferences
- **Theme Support**: Light/dark mode with auto-detection
- **Display Options**: Customizable UI preferences
- **Notification Settings**: Configurable alert systems
- **Workflow Preferences**: Customizable user workflows

## Integration Capabilities

### External Services
- **Barcode Lookup**: OpenFoodFacts integration
- **Calendar Export**: iCal export for external calendars
- **Webhook Support**: Configurable webhook integrations
- **API Integration**: Full REST API for external systems

### Hardware Integration
- **Barcode Scanners**: USB barcode scanner support
- **Label Printers**: Thermal and regular printer support
- **Camera Support**: Mobile device camera integration
- **Touch Interface**: Mobile-optimized touch interface

## Deployment Architecture

### System Requirements
- **PHP**: 8.2 or 8.3
- **SQLite**: 3.34.0+ (recommended 3.39.4+ for performance)
- **Web Server**: Apache/Nginx with URL rewriting
- **Browser**: Modern browsers (Chrome, Firefox, Edge)

### Installation Options
- **Manual Installation**: Traditional web server deployment
- **Docker**: Official Docker images available
- **Desktop Application**: Grocy Desktop for Windows
- **Cloud Deployment**: Compatible with various cloud platforms

### Maintenance
- **Update System**: Automated update mechanisms
- **Backup System**: Built-in backup functionality
- **Database Maintenance**: Automatic database optimization
- **Log Management**: Comprehensive logging system

## Performance Characteristics

### Database Performance
- **Efficient Queries**: Optimized database queries
- **Caching Layer**: Cached views for complex calculations
- **Index Strategy**: Comprehensive database indexing
- **Query Optimization**: SQLite-specific optimizations

### Frontend Performance
- **Asset Optimization**: Minified and compressed assets
- **Progressive Loading**: Deferred loading strategies
- **Responsive Design**: Mobile-optimized interface
- **Offline Capability**: PWA support for offline usage

### Scalability
- **Single-user Focus**: Optimized for household use
- **Multi-user Support**: Supports multiple household members
- **Data Volume**: Handles large product catalogs
- **Performance Monitoring**: Built-in performance tracking

## Extensibility

### Plugin System
- **Barcode Lookup Plugins**: Extensible barcode lookup system
- **Custom Plugins**: Support for custom functionality
- **API Extensions**: REST API for external integrations
- **Webhook System**: Event-driven integrations

### Customization
- **User Fields**: Custom field support
- **User Entities**: Custom entity creation
- **Themes**: Customizable appearance
- **Workflows**: Configurable user workflows

### Development
- **Open Source**: MIT licensed
- **Development Mode**: Built-in development features
- **Testing**: Comprehensive testing framework
- **Documentation**: Extensive API documentation

## Error Handling & Logging

### Error Management
- **Exception Handling**: Comprehensive error handling
- **User-friendly Messages**: Localized error messages
- **Logging System**: Detailed error logging
- **Debug Mode**: Development debugging features

### Monitoring
- **Performance Metrics**: Built-in performance monitoring
- **Usage Statistics**: Optional usage tracking
- **Health Checks**: System health monitoring
- **Audit Trail**: Complete activity logging

## Compliance & Standards

### Web Standards
- **HTML5**: Modern web standards compliance
- **CSS3**: Advanced styling capabilities
- **JavaScript ES6+**: Modern JavaScript features
- **Progressive Web App**: PWA capabilities

### API Standards
- **REST Architecture**: RESTful API design
- **OpenAPI Specification**: Comprehensive API documentation
- **JSON Standards**: Consistent JSON responses
- **HTTP Standards**: Proper HTTP status codes

### Security Standards
- **OWASP Guidelines**: Security best practices
- **Data Protection**: Privacy-focused design
- **Secure Coding**: Secure development practices
- **Regular Updates**: Security patch management