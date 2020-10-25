<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <el-form
        ref="loginFormRef"
        :rules="loginFormRules"
        :model="loginForm"
        class="login_form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
          ></el-input>
        </el-form-item>
        <!-- 底部按钮区域 -->
        <el-form-item class="login_btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 登录表单的验证规则对象
      loginFormRules: {
        // 用户名的验证
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '请输入的长度在3-10之间',
            trigger: 'blur'
          }
        ],
        // 密码的验证
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '请输入的长度在6-15之间',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮实现表单重置功能
    resetLoginForm() {
      console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    // 点击登录按钮的时候进行预验证
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid)
        // 预验证没有通过阻止代码向下执行
        if (!valid) return
        // 否则验证通过发送请求
        const { data: res } = await this.$http.post('login', this.loginForm)
        // console.log(res)
        // 登录失败的时候
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        // 登录成功
        this.$message.success('登录成功')
        // console.log(res)
        // 登录成功后把服务器端返回的结果中的token保存在本地的sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        // 跳转到管理后台页面
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  border-radius: 3px;
  background-color: #fff;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  .login_btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
