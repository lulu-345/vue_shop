<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索框与添加区域区域 -->
      <el-row :gutter="20">
        <!-- 搜索框 -->
        <el-col :span="9">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            clearable
            @clear="getUsersList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUsersList"
            ></el-button>
          </el-input>
        </el-col>
        <!-- 添加用户按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="usersList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialogAppear(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              :enterable="false"
              effect="dark"
              content="分配角色"
              placement="top"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加用户的dialog对话框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="closeDialogResetForm"
      >
        <!-- 对话框的主体区域 -->
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="70px"
        >
          <!-- 用户名 -->
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input> </el-form-item
          ><!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input> </el-form-item
          ><!-- 手机号 -->
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 对话框的底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户的对话框 -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="resetEditForm"
      >
        <el-form
          :model="editForm"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="70px"
        >
          <!-- 用户名 -->
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <!-- 手机号 -->
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  // 声明周期钩子函数
  created() {
    this.getUsersList()
  },
  data() {
    // 自定义邮箱的验证规则
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱地址的正则表达式
      const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      // 如果验证通过
      if (regEmail.test(value)) {
        return callback()
      }
      // 验证没有通过
      callback(new Error('请输入正确格式的邮箱地址格式'))
    }
    // 自定义手机号的验证规则
    var checkMobile = (rule, value, callback) => {
      // 手机号的正则表达式
      const regMobile = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
      // 如果验证成功
      if (regMobile.test(value)) {
        return callback()
      }
      // 验证失败给出提示信息
      callback(new Error('请输入正确的手机号码'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        // 搜索的关键字
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      total: 0,
      usersList: [],
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加表单数据对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },

      // 添加表单的规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 6,
            message: '用户名的长度在3-6位',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '密码的长度在6-15位',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 点击修改的那个用户的信息
      editForm: {},
      // 定义修改用户对话框中的表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    async getUsersList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      // console.log(res)
      // 请求失败的时候给出错误提示
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      // 代码能走到这一步说明请求成功了
      this.total = res.data.total
      this.usersList = res.data.users
    },
    // 当用户选择一页显示多少条数据的时候
    handleSizeChange(val) {
      // 把这个用户选择的最新的值给私有数据
      this.queryInfo.pagesize = val
      // 重新渲染用户列表数据
      this.getUsersList()
    },
    // 当用户直接点击到某一页的时候
    handleCurrentChange(val) {
      // 把用户点击到的那个页给私有数据
      this.queryInfo.pagenum = val
      // 重新渲染用户列表数据
      this.getUsersList()
    },
    // 修改用户信息状态
    async userStateChanged(userInfo) {
      // console.log(userInfo)
      // 发送请求修改用户列表的状态
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      // 如果请求失败，给出提示
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('状态修改失败')
      }
      // 请求成功了直接该处提示告诉修改成功了
      this.$message.success('修改用户状态成功')
    },
    // 关闭对话框的时候实现重置表单
    closeDialogResetForm() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击对话框中的确定按钮进行添加预验证
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error(
            '请检查您在表单中输入的内容不符合规范，请检查！'
          )
        }
        // 预验证通过可以添加用户的请求了
        const { data: res } = await this.$http.post('users', this.addForm)
        // 请求失败的话给出提示
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        // 请求发送成功了
        // 关闭对话框
        this.addDialogVisible = false
        // 重新加载最新的用户列表
        this.getUsersList()
      })
    },
    // 点击用户列表中的修改按钮后
    async editDialogAppear(id) {
      // 发送请求根据id来查询到这个用户信息
      const { data: res } = await this.$http.get('users/' + id)
      // 请求发送失败的话给出提示信息
      if (res.meta.status !== 200) {
        return this.$message.error('修改用户信息失败')
      }
      // 请求发送成功，将用户信息保存在私有数据中
      this.editForm = res.data
      // 显示修改用户的对话框
      this.editDialogVisible = true
    },
    // 当关闭了修改对话框的时候进行重置表单
    resetEditForm() {
      this.$refs.editFormRef.resetFields()
    },
    // 当点击了对话框中的修改表单中的确定按钮的时候
    editUserInfo() {
      // 预验证
      this.$refs.editFormRef.validate(async valid => {
        // 验证没有通过
        if (!valid) {
          return this.$message.error('您填写的表单内容有错误')
        }
        // 预验证通过，可以发送修改用户信息的请求了
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        // 请求失败的时候
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败')
        }
        // 请求成功
        // 隐藏对话框
        this.editDialogVisible = false
        // 刷新用户列表
        this.getUsersList()
        // 告诉修改用户信息成功
        this.$message.success('修改用户信息成功')
      })
    },
    // 当用户点击用户列表中的删除按钮的时候
    async deleteUserById(id) {
      // 弹出一个确认框
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '我要确定确定',
          cancelButtonText: '我要取消',
          type: 'warning'
        }
      ).catch(err => err)
      // console.log(confirmResult)
      // 取消了删除操作
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除操作')
      }
      // 用户点击了弹框的确认按钮可以进行删除操作了
      const { data: res } = await this.$http.delete('users/' + id)
      // 删除失败给出提示
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      // 删除成功，给出提示
      this.$message.success('删除用户成功')
      // 重新刷新用户列表
      this.getUsersList()
    }
  }
}
</script>

<style lang="less" scoped></style>
