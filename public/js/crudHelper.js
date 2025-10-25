class CrudHelper {
    constructor(tableName) {
        this.tableName = tableName;
        this.baseUrl = `/crud/${tableName}`;
        this.csrfToken = document.querySelector('input[name="_token"]')?.value;
    }

    // Set CSRF token manually if needed
    setCsrfToken(token) {
        this.csrfToken = token;
    }

    // CREATE - Create new record in any table
    async create(data) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Create error:', error);
            return { success: false, message: 'Network error' };
        }
    }

    // READ ALL - Get all records from any table
    async readAll() {
        try {
            const response = await fetch(this.baseUrl);
            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('Read all error:', error);
            return [];
        }
    }

    // READ ONE - Get single record from any table
    async readOne(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Read one error:', error);
            return { success: false, message: 'Network error' };
        }
    }

    // UPDATE - Update record in any table
    async update(id, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Update error:', error);
            return { success: false, message: 'Network error' };
        }
    }

    // DELETE - Delete record from any table
    async delete(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': this.csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Delete error:', error);
            return { success: false, message: 'Network error' };
        }
    }

    // GET TABLE COLUMNS - Useful for dynamic forms
    async getColumns() {
        try {
            const response = await fetch(`${this.baseUrl}/columns/info`);
            const result = await response.json();
            return result.success ? result.columns : [];
        } catch (error) {
            console.error('Get columns error:', error);
            return [];
        }
    }

    // DYNAMIC FORM GENERATOR - Creates form based on table columns
    async generateForm(containerId, editData = null) {
        const columns = await this.getColumns();
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        let formHTML = '';
        
        columns.forEach(column => {
            // Skip these columns for forms
            if (['id', 'created_at', 'updated_at', 'email_verified_at', 'remember_token'].includes(column)) {
                return;
            }

            const label = column.charAt(0).toUpperCase() + column.slice(1).replace('_', ' ');
            const value = editData ? editData[column] : '';
            
            if (column === 'password') {
                formHTML += `
                    <div class="form-group">
                        <label for="${column}">${label}:</label>
                        <input type="password" id="${column}" name="${column}" value="" 
                               class="form-input" ${!editData ? 'required' : ''}>
                    </div>
                `;
            } else if (column.includes('description') || column.includes('content')) {
                formHTML += `
                    <div class="form-group">
                        <label for="${column}">${label}:</label>
                        <textarea id="${column}" name="${column}" class="form-textarea">${value}</textarea>
                    </div>
                `;
            } else {
                const inputType = column.includes('email') ? 'email' : 
                                column.includes('date') ? 'date' : 'text';
                
                formHTML += `
                    <div class="form-group">
                        <label for="${column}">${label}:</label>
                        <input type="${inputType}" id="${column}" name="${column}" value="${value}" 
                               class="form-input" ${!editData && column.includes('email') ? 'required' : ''}>
                    </div>
                `;
            }
        });

        container.innerHTML = formHTML;
    }
}