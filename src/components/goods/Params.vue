<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!--警告提示框区域 -->
      <el-alert
        show-icon
        :closable="false"
        title="注意：只允许为第三级分类设置相关参数!"
        type="warning"
      >
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 级联选择框区域 -->
          <el-cascader
            :options="catesList"
            :props="catesProps"
            v-model="selectedKeysArr"
            @change="selectChanged"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs标签页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            size="mini"
            type="primary"
            :disabled="isBtnsDisable"
            @click="addParamsDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数的表格区域 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="closeTagEvent(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 可编辑的tag标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <!-- 参数名称列 -->
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 修改按钮 -->
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >修改</el-button
                >
                <!-- 删除按钮 -->
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            size="mini"
            type="primary"
            :disabled="isBtnsDisable"
            @click="addParamsDialogVisible = true"
            >添加属性</el-button
          >
          <!--静态属性的表格区域 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="closeTagEvent(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 可编辑的tag标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <!-- 属性名称列 -->
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 修改按钮 -->
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >修改</el-button
                >
                <!-- 删除按钮 -->
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框，两个按钮公用一个对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addParamsDialogVisible"
      width="50%"
      @close="addParamsDialogClosed"
    >
      <!-- 对话框中的表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框，两个按钮公用一个对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editParamsDialogVisible"
      width="50%"
      @close="editParamsDialogClosed"
    >
      <!-- 对话框中的表单 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有的分类列表数据
      catesList: [],
      // 级联选择器的属性配置对象
      catesProps: {
        children: 'children',
        label: 'cat_name',
        value: 'cat_id',
        expandTrigger: 'hover'
      },
      // 级联选择器已经选择的分类的id组成的数组
      selectedKeysArr: [],
      // tab栏中当前选中的tab项的名字,默认为第一个
      activeName: 'many',
      // 动态参数这个tab栏对应的参数数据列表
      manyTableData: [],
      // 静态属性这个tab栏对应的参数数据列表
      onlyTableData: [],
      // 控制添加参数对话框的显示和隐藏
      addParamsDialogVisible: false,
      // 添加分类的表单对象
      addForm: {
        attr_name: ''
      },
      // 添加分类的表单中的验证规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      },
      // 控制修改参数对话框的显示和隐藏
      editParamsDialogVisible: false,
      // 修改分类的表单对象
      editForm: {
        attr_name: ''
      },
      // 修改分类的表单中的验证规则
      editFormRules: {
        attr_name: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      }
    }
  },
  created() {
    // 调用获取分类列表的函数
    this.getCatesList()
  },
  methods: {
    // 获取分类列表数据的函数
    async getCatesList() {
      const { data: res } = await this.$http.get('categories')
      // 请求发送失败的时候给出提示信息
      if (res.meta.status !== 200) {
        return this.message.error('获取分类列表数据失败')
      }
      // 请求成功的时候给私有数据赋值
      this.catesList = res.data
      // console.log(this.catesList)
    },
    // 级联选择器中选择的分类发生改变的时候
    selectChanged() {
      // 获取分类参数列表数据
      this.getParamsFun()
    },
    // 当tab栏切换的时候
    handleTabClick() {
      // console.log(this.activeName)
      // 获取分类参数列表数据
      this.getParamsFun()
    },
    // 获取分类参数列表数据的函数
    async getParamsFun() {
      // 打印已经选择的分类的id组成的数组
      // console.log(this.selectedKeysArr)
      // 只能选择三级分类
      if (this.selectedKeysArr.length !== 3) {
        this.selectedKeysArr = []
        // 清空动态参数列表数据
        this.manyTableData = []
        // 清空静态属性参数列表数据
        this.onlyTableData = []
        return this.$message.error('请选择三级分类')
      }
      // 发送请求获取到分类参数列表
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      // 请求发送失败的时候，给出错误提示
      if (res.meta.status !== 200) {
        return this.message.error('获取参数列表数据失败')
      }
      // 把服务器器端返回的数据中的attr_vals属性中的字符串都转化为数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 给可编辑tag标签的input框添加inputVisible属性并赋初始值
        item.inputVisible = false
        // 给可编辑tag标签的input框添加inputValue属性并赋初始值
        item.inputValue = ''
      })

      // 根据当前选择的tab栏来决定存储哪个数据
      // 如果选择的是动态参数这个tab栏
      if (this.activeName === 'many') {
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else {
        // 选择的静态属性这个tab栏
        this.onlyTableData = res.data
      }
    },
    // 当添加参数对话框关闭的时候
    addParamsDialogClosed() {
      // 重置表单内容
      this.$refs.addFormRef.resetFields()
    },
    // 当修改参数的对话框关闭的时候
    editParamsDialogClosed() {
      // 重置表单内容
      this.$refs.editFormRef.resetFields()
    },
    // 当点击了添加分类对话框的确定按钮的时候
    addParams() {
      // 首先进行表单的预验证
      this.$refs.addFormRef.validate(async valid => {
        // 如果验证不通过给出错误提示
        if (!valid) {
          return this.$message.error('请填写正确的表单内容')
        }
        // 验证通过的时候就可以发送添加参数的请求了
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // 如果请求发送失败给出错误提示信息
        if (res.meta.status !== 201) {
          return this.message.error('添加参数失败')
        }
        // 请求发送成功，刷新参数列表数据
        this.getParamsFun()
        // 关闭对话框
        this.addParamsDialogVisible = false
      })
    },

    // 当点击参数列表中的修改按钮的时候
    async showEditDialog(attrId) {
      // console.log(attrId)
      // 根据id发送请求获取到当前参数的数据
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      )
      // 请求发送失败的时候
      if (res.meta.status !== 200) {
        console.log(res.meta.status)
        return this.$message.error('获取参数信息失败')
      }
      // 请求发送成功的时候
      this.editForm = res.data

      // // 弹出对话框
      this.editParamsDialogVisible = true
    },
    // 当点击了修改对话框的确定按钮的时候
    editParams() {
      // 表单预验证
      this.$refs.editFormRef.validate(async valid => {
        // 如果验证失败给出提示
        if (!valid) {
          return this.$message.error('表单预验证失败')
        }
        // 验证成功了，发送请求修改参数
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // 请求发送失败的时候，给出提示信息
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败')
        }
        // 请求发送成功的时候，刷新参数列表
        this.getParamsFun()
        // 给出修改成功的信息提示
        this.$message.success('修改参数信息成功')
        // 关闭对话框
        this.editParamsDialogVisible = false
      })
    },
    // 当用户点击了删除按钮的时候
    async removeParams(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 当用户点击取消的时候
      if (confirmResult !== 'confirm') {
        return this.$message.info('您已经取消了删除操作')
      }
      // 用户点击了确定按钮,发送请求执行删除操作
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      )
      // 请求发送失败的时候
      if (res.meta.status !== 200) {
        return this.$message.error('获取xx失败')
      }
      // 请求发送成功了，给出提示
      this.$message.success('删除参数成功')
      // 刷新参数列表数据
      this.getParamsFun()
    },
    // 当点击了可编辑tag标签的按钮的时候
    showInput(row) {
      row.inputVisible = true
      // 让input框自动获取到焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 当确定了可编辑tag标签的输入框的时候
    async handleInputConfirm(row) {
      // 如果用户输入的是空格
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 拿到用户输入的的值push到row.attr_vals这个数组里面去
      row.attr_vals.push(row.inputValue.trim())
      // 清空
      row.inputValue = ''
      // 隐藏输入框
      row.inputVisible = false
      // 调用optTagFun函数实现添加操作
      this.optTagFun(row)
    },
    // 当可编辑tag标签被删除的时候触发
    closeTagEvent(index, row) {
      row.attr_vals.splice(index, 1)
      // 调用optTagFun函数实现删除操作
      this.optTagFun(row)
    },
    // 封装一个函数用来删除或者添加可编辑tag标签的函数，多次调用
    async optTagFun(row) {
      // 发送请求
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      // 如果请求发送失败
      if (res.meta.status !== 200) {
        return this.$message.error('操作失败')
      }
      // 如果请求发送成功，给出提示
      this.$message.success('操作成功')
    }
  },
  computed: {
    // 计算属性 添加按钮是否被禁用，返回的是布尔值
    isBtnsDisable() {
      // 如果用户没有选择三级分类，就应该禁用按钮，返回true
      if (this.selectedKeysArr.length !== 3) {
        return true
      }
      // 否则的话就返回false
      return false
    },
    // 计算用户在级联选择框中选择的第三级分类的id值
    cateId() {
      if (this.selectedKeysArr.length === 3) {
        return this.selectedKeysArr[2]
      }
      // 否则返回空
      return null
    },
    // 计算添加参数的对话框文本内容
    titleText() {
      // 根据当前激活的tab栏来返回不同的值
      if (this.activeName === 'many') {
        return '动态参数'
      }
      // 否则的话
      return '静态属性'
    }
  }
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 200px;
}
</style>
