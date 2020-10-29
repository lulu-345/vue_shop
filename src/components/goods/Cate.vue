<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCateDialogShow"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <tree-table
        :data="catesList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        border
        :show-row-hover="false"
        class="treeTable"
      >
        <!-- 是否有效这一列的自定义模板 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen;"
          ></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>
        <!-- 排序这一列的自定义模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" type="primary" v-if="scope.row.cat_level === 0"
            >一级</el-tag
          >
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作这一列的自定义模板 -->
        <template slot="opt" slot-scope="">
          <el-button size="mini" type="primary" icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button size="mini" type="danger" icon="el-icon-delete"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 点击添加分类按钮后弹出的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="closeDialogClearData"
    >
      <el-form
        ref="addCateFormRef"
        :model="addCateForm"
        label-width="100px"
        :rules="addCateFormRules"
      >
        <!-- 分类名称输入框 -->
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <!-- 父级分类级联选择器 -->
        <el-form-item label="父级分类：">
          <el-cascader
            :options="parentsCatesList"
            :props="propsSettingObj"
            v-model="selectedIdsArr"
            clearable
            @change="printSelectedIdsArr"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 分类列表的数据
      catesList: [],
      // 请求参数数据
      queryInfo: {
        // 获取到三级分类列表
        type: 3,
        // 当前的页码号
        pagenum: 1,
        // 每一页显示的数据条数
        pagesize: 5
      },
      // 总的数据条数
      total: 0,
      // 树形表格的列数据
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否有效',
          // 表示当前列为自定义模板列
          type: 'template',
          // 表示当前这一列使用的模板名称是
          template: 'isok'
        },
        {
          label: '排序',
          // 表示当前列为自定义模板列
          type: 'template',
          // 表示当前这一列使用的模板名称是
          template: 'order'
        },
        {
          label: '操作',
          // 表示当前列为自定义模板列
          type: 'template',
          // 表示当前这一列使用的模板名称是
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类对话框中的表单的数据对象
      addCateForm: {
        // 分类名称
        cat_name: '',
        // 分类父id，默认让它为0，
        cat_pid: 0,
        // 分类层级，默认让它为0 ，一级
        cat_level: 0
      },
      // 分类名称input框的验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 8, message: '请输入2-8个字符之间', trigger: 'blur' }
        ]
      },
      // 所有的父级分类列表数据
      parentsCatesList: [],
      // 级联选择器的属性配置对象
      propsSettingObj: {
        // 有嵌套关系的那个属性
        children: 'children',
        // 级联选择器中显示的那个属性
        label: 'cat_name',
        // 选择的那个属性
        value: 'cat_id',
        // 次级菜单的展开方式
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 级联选择器中已经选中的那些类的id组成的数组
      selectedIdsArr: []
    }
  },
  created() {
    // 调用获取分类列表的函数
    this.getCatesList()
  },
  methods: {
    // 定义获取分类列表数据的函数
    async getCatesList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      // 如果请求发送失败的时候
      if (res.meta.status !== 200) {
        return this.message.error('获取分类列表数据失败')
      }
      // 亲求发送成功了
      // 把服务器端返回的分类列表数据保存在私有数据中
      this.catesList = res.data.result
      // 服务器端返回的总的数据条数保存在私有数据中
      this.total = res.data.total
      console.log(this.catesList)
    },
    // 分页中的改变每一页显示多少条数据的时候
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      // 重新获取分类列表数据
      this.getCatesList()
    },
    // 当用户改变分页中的当前页的时候
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      // 重新获取分类列表数据
      this.getCatesList()
    },
    // 当用户点击了添加分类按钮后
    addCateDialogShow() {
      // 先获取到所有的父级分类列表数据
      this.getParentsCatesList()
      // 让对话框显示出来
      this.addCateDialogVisible = true
    },
    // 获取所有的父级分类列表数据（一级和二级）
    async getParentsCatesList() {
      // 发送请求获取数据
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      // 请求发送失败的时候给出错误提示
      if (res.meta.status !== 200) {
        return this.message.error('获取父级分类数据失败')
      }
      // 请求发送成功了把数据赋值给私有数据
      this.parentsCatesList = res.data
      console.log(this.parentsCatesList)
    },
    // 级联选择框发生变化的时候触发
    printSelectedIdsArr() {
      // console.log(this.selectedIdsArr)
      // 如果用户选择了父分类
      if (this.selectedIdsArr.length > 0) {
        // 拿到父分类的id重新赋值给私有数据
        this.addCateForm.cat_pid = this.selectedIdsArr[
          this.selectedIdsArr.length - 1
        ]
        // 拿到父分类的层级赋值给私有数据
        this.addCateForm.cat_level = this.selectedIdsArr.length
      } else {
        // 否则就是用户没有选择父分类
        // 把私有数据的父id设置为0
        this.addCateForm.cat_pid = 0
        // 把私有数据父分类的层级也设置成0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击了添加分类对话框中的确定按钮的时候
    addCate() {
      // console.log(this.addCateForm)
      // 表单预验证
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('表单预验证失败')
        }
        // 预验证成功，发送添加分类的请求
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        // 发送请求失败
        if (res.meta.status !== 201) {
          return this.message.error('添加分类失败')
        }
        // 请求发送成功
        // 刷新分类列表
        this.getCatesList()
        // 关闭对话框
        this.addCateDialogVisible = false
      })
    },
    // 当对话框关闭的时候重置表单和清空级联选择器已选数据
    closeDialogClearData() {
      // 重置表单
      this.$refs.addCateFormRef.resetFields()
      // 清空级联选择器的已选数据
      this.selectedIdsArr = ''
      this.addCateForm.cat_pid = ''
      this.addCateForm.cat_level = ''
    }
  }
}
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
</style>
