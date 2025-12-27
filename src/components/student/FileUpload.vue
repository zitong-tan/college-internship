<template>
  <div class="file-upload">
    <!-- Upload Section -->
    <el-card class="upload-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Upload /></el-icon>
          <span>上传文件</span>
        </div>
      </template>
      
      <el-upload
        ref="uploadRef"
        :action="uploadUrl"
        :headers="uploadHeaders"
        :before-upload="beforeUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :on-progress="handleProgress"
        :file-list="fileList"
        :auto-upload="true"
        :show-file-list="false"
        drag
        multiple
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 PDF、DOC、DOCX、JPG、PNG 格式，单个文件不超过 10MB
          </div>
        </template>
      </el-upload>
      
      <!-- Upload Progress -->
      <div v-if="uploading" class="upload-progress">
        <el-progress
          :percentage="uploadProgress"
          :status="uploadProgress === 100 ? 'success' : undefined"
        />
        <span class="progress-text">上传中... {{ uploadProgress }}%</span>
      </div>
    </el-card>

    <!-- Files List -->
    <el-card class="files-list-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><Folder /></el-icon>
          <span>已上传文件 ({{ total }})</span>
        </div>
      </template>
      
      <div v-loading="loading" class="files-list">
        <el-empty v-if="!loading && files.length === 0" description="暂无文件" />
        
        <el-table
          v-if="files.length > 0"
          :data="files"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="file_name" label="文件名" min-width="200">
            <template #default="{ row }">
              <div class="file-name-cell">
                <el-icon class="file-icon">
                  <component :is="getFileIcon(row.file_type)" />
                </el-icon>
                <span>{{ row.file_name }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="file_type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ row.file_type || 'unknown' }}</el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="file_size" label="大小" width="120">
            <template #default="{ row }">
              {{ formatFileSize(row.file_size) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="uploaded_at" label="上传时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.uploaded_at) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                link
                @click="handleDownload(row)"
              >
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <el-button
                type="danger"
                size="small"
                link
                @click="handleDelete(row)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Pagination -->
      <div v-if="total > pagination.pageSize" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Upload,
  UploadFilled,
  Folder,
  Download,
  Delete,
  Document,
  Picture
} from '@element-plus/icons-vue';
import { uploadFile as _uploadFile, getFiles } from '@/api/internship';
import { useStore } from 'vuex';

const props = defineProps({
  internshipId: {
    type: [Number, String],
    required: true
  }
});

const store = useStore();

// State
const loading = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const files = ref([]);
const total = ref(0);
const uploadRef = ref(null);
const fileList = ref([]);

const pagination = reactive({
  page: 1,
  pageSize: 10
});

// Computed
const uploadUrl = computed(() => {
  return `${process.env.VUE_APP_API_BASE_URL || '/api'}/internships/${props.internshipId}/files`;
});

const uploadHeaders = computed(() => {
  const token = store.state.auth.token;
  return {
    Authorization: `Bearer ${token}`
  };
});

// Methods
const fetchFiles = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize
    };
    
    const response = await getFiles(props.internshipId, params);
    if (response.success) {
      files.value = response.data.files || response.data.rows || [];
      total.value = response.data.total || 0;
    }
  } catch (error) {
    console.error('Failed to fetch files:', error);
    ElMessage.error('获取文件列表失败');
  } finally {
    loading.value = false;
  }
};

const beforeUpload = (file) => {
  // Check file type
  const allowedTypes = ['application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg', 'image/jpg', 'image/png'];
  
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    ElMessage.error('只支持 PDF、DOC、DOCX、JPG、PNG 格式的文件');
    return false;
  }
  
  // Check file size (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 10MB');
    return false;
  }
  
  uploading.value = true;
  uploadProgress.value = 0;
  
  return true;
};

const handleProgress = (event) => {
  uploadProgress.value = Math.floor(event.percent);
};

const handleUploadSuccess = (response) => {
  uploading.value = false;
  uploadProgress.value = 0;
  
  if (response.success) {
    ElMessage.success('文件上传成功！');
    
    // Refresh files list
    pagination.page = 1;
    fetchFiles();
  } else {
    ElMessage.error(response.error?.message || '文件上传失败');
  }
};

const handleUploadError = (error) => {
  uploading.value = false;
  uploadProgress.value = 0;
  
  console.error('Upload error:', error);
  ElMessage.error('文件上传失败');
};

const handleDownload = (file) => {
  // Create download link
  const link = document.createElement('a');
  link.href = file.file_path;
  link.download = file.file_name;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleDelete = async (file) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${file.file_name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // TODO: Implement delete API
    ElMessage.info('删除功能待实现');
    
  } catch (error) {
    // User cancelled
  }
};

const handlePageChange = (page) => {
  pagination.page = page;
  fetchFiles();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchFiles();
};

const getFileIcon = (fileType) => {
  if (!fileType) return Document;
  
  if (fileType.includes('image')) {
    return Picture;
  }
  
  return Document;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('zh-CN');
};

// Lifecycle
onMounted(() => {
  fetchFiles();
});
</script>

<style scoped>
.file-upload {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.upload-card {
  margin-bottom: 0;
}

.upload-progress {
  margin-top: 20px;
  padding: 16px;
  background: #F5F7FA;
  border-radius: 4px;
}

.progress-text {
  display: block;
  margin-top: 8px;
  text-align: center;
  color: #606266;
  font-size: 14px;
}

.files-list {
  min-height: 200px;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 18px;
  color: #409EFF;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
