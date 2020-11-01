<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon closable>
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tabs标签区域 -->
      <!-- 对外层用form表单包裹住 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <!-- 商品分类级联选择框 -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                :options="catesList"
                :props="catesProps"
                v-model="addForm.goods_cat"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in manyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <!-- 复选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(item2, index) in item.attr_vals"
                  :key="index"
                  :label="item2"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 商品属性面板 -->
            <el-form-item
              v-for="item in onlyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传图片区域 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="setHeaderObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" style="margin-top:15px;" @click="addGoods"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片的dialog对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%"
    >
      <img class="previewImg" :src="previewURL" alt="" />
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 级联选择器中已经选择选中的分类id组成的数组
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 所有的分类列表数据
      catesList: [],
      // 级联选择框的属性配置对象
      catesProps: {
        children: 'children',
        label: 'cat_name',
        value: 'cat_id',
        expandTrigger: 'hover'
      },
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 图片上传到的服务器地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片的url地址绝对路径
      previewURL: '',
      // 控制预览图片对话框的显示与隐藏
      previewDialogVisible: false,
      // 给图片上传组件设置请求头加token
      setHeaderObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品分类', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 调用获取所有分类列表数据的函数
    this.getCatesList()
  },
  computed: {
    // 拿到三级分类的id
    cateId() {
      // 如果选择的是三级分类
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      // 否则
      return null
    }
  },
  methods: {
    async getCatesList() {
      // 发送请求获取分类列表数据
      const { data: res } = await this.$http.get('categories')
      // 请求发送失败的时候
      if (res.meta.status !== 200) {
        return this.$message.error('获取xx失败')
      }
      // 请求发送成功把数据赋值给私有数据
      this.catesList = res.data
    },
    // 当级联选择器的选择发生改变的时候触发
    handleChange() {
      console.log(this.addForm.goods_cat)
      // 如果用户选择的不是三级分类就清空数组
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        this.$message.error('请选择三级分类')
      }
    },
    // 在基本信息面板没有选择三级商品分类的时候阻止tab栏切换
    beforeTabLeave(activeName, oldActiveName) {
      // 如果在基本信息面板中没有选择三级商品分类
      if (oldActiveName === '0' && this.addForm.goods_cat.length === 0) {
        // 给出提示错误提示信息
        this.$message.error('请选择三级商品分类')
        // 阻止tab栏切换
        return false
      }
    },
    // tab栏点击的时候
    async tabClick() {
      // 如果点击的是商品参数这个tab栏就发送请求
      if (this.activeIndex === '1') {
        // 发送请求
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'many'
            }
          }
        )
        // 请求发送失败的时候
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数数据失败')
        }
        // 请求发送成功
        // 修改响应数据中的attr_vals为一个数组
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        // 把获取到的动态参数数据放在私有数据中
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        // 发送请求获取静态属性数据
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: 'only'
            }
          }
        )
        // 请求发送失败的时候
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性数据失败')
        }
        // 请求发送成功
        // 把获取到的动态参数数据放在私有数据中
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    // 点击图片预览的时候触发
    handlePreview(file) {
      console.log(file)
      // 拿到这个图片的url地址保存到私有数据
      this.previewURL = file.response.data.url
      // 让预览图片的对话框显示出来
      this.previewDialogVisible = true
    },
    // 点击删除图片的时候触发
    handleRemove(file) {
      console.log(file)
      // 拿到这个图片的临时路径
      const filePath = file.response.data.tmp_path
      // // 根据这个临时路径到数组中找到它所在的索引
      // const index = this.addForm.pics.findIndex(item => filePath === item.pic)
      // // 根据索引使用splic方法删除
      // this.addForm.pics.splice(index, 1)
      // 方法二直接使用filter方法
      this.addForm.pics = this.addForm.pics.filter(
        item => item.pic !== filePath
      )
      console.log(this.addForm.pics)
    },
    // 图片上传成功之后触发
    handleSuccess(response) {
      // console.log(response)
      const picInfo = {
        pic: response.data.tmp_path
      }
      this.addForm.pics.push(picInfo)
      console.log(this.addForm.pics)
    },
    // 当点击了添加商品按钮的时候
    addGoods() {
      // 进行表单的预验证
      this.$refs.addFormRef.validate(async valid => {
        // 如果验证不通过给出错误提示
        if (!valid) {
          this.$message.error('请填写必要的表单项')
        }
        // 预验证通过
        // console.log(this.addForm)
        // 对goods_cat数据进行处理
        // 不能直接的使用下面的这种方法
        // this.addForm.goods_cat = this.addForm.goods_cat.join(',')
        // 要使用lodash对goods_cat数据进行处理
        const newAddForm = _.cloneDeep(this.addForm)
        newAddForm.goods_cat = newAddForm.goods_cat.join(',')

        // 对数据attrs的处理
        // 处理动态参数
        this.manyTableData.forEach(ite => {
          const newInfo = {
            attr_id: ite.attr_id,
            attr_value: ite.attr_vals.join(' ')
          }
          newAddForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item2 => {
          const newInfo2 = {
            attr_id: item2.attr_id,
            attr_value: item2.attr_vals
          }
          newAddForm.attrs.push(newInfo2)
        })
        console.log(newAddForm)
        // 发送请求添加商品
        const { data: res } = await this.$http.post('goods', newAddForm)
        // 请求发送失败的时候给出提示
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        // 请求发送成功后页面跳转到商品列表页面
        this.$router.push('/goods')
      })
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
</style>
