<template>
  <div>
    <div>
      <div>
        <b-row class="row">
          <b-col v-if="isAdmin" class="col-3" style="margin: 50px;">
            <h3>Add Product</h3>
            <div class="form-group">
              <label for="productname">Product Name</label>
              <input
                type="text"
                class="form-control"
                id="productname"
                placeholder="Enter name"
                v-model="product.name"
              >
              <br>
            </div>
            <div class="form-group">
              <label v-if="mode === 'add'" for="addproductimage">Add Product Image</label>
              <label v-if="mode === 'upd'" for="addproductimage">Change Product Image</label>
              <input type="file" class="form-control" @change="previewFile" id="addproductimage">
              <br>
            </div>
            <div class="form-group">
              <label for="productprice">Product Price</label>
              <input
                type="number"
                class="form-control"
                id="productprice"
                placeholder="Enter price"
                v-model="product.price"
              >
              <br>
            </div>
            <div class="form-group">
              <label for="productstock">Product Stock</label>
              <input
                v-model="product.stock"
                type="number"
                class="form-control"
                id="productstock"
                placeholder="Enter stock"
                min="1"
                max="20"
              >
              <br>
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                v-model="product.description"
                id="description"
                placeholder="product description"
              ></textarea>
              <br>
            </div>
            <div class="form-group">
              <button
                v-if="mode === 'add'"
                type="button"
                @click="newProduct"
                class="btn btn-outline-secondary btn-sm btn-block"
              >Upload</button>
              <button
                v-if="mode === 'upd'"
                type="button"
                @click="updProduct"
                class="btn btn-outline-secondary btn-sm btn-block"
              >Update</button>
              <button
                v-if="mode === 'upd'"
                type="button"
                @click="cancelUpd"
                class="btn btn-outline-secondary btn-sm btn-block"
              >Cancel</button>
            </div>
          </b-col>
          <div class="col" style="margin: 50px 0px 50px 50px;">
            <h3>All products</h3>
            <listitems
              v-on:atc="atc"
              v-on:deleteItem="deleteItem"
              v-on:updateItem="updateItem"
              :isAdmin="isAdmin"
              :items="items"
              :isLogin="isLogin"
            />
          </div>
        </b-row>
      </div>
    </div>
  </div>
</template>

<script>
import listitems from "@/components/listitems";
import swal from "sweetalert";

export default {
  name: "Product",
  props: ["isLogin", "userId", "isAdmin", "items"],
  data: function() {
    return {
      product: {
        _id: "",
        name: "",
        image: "",
        price: null,
        stock: null,
        description: ""
      },
      mode: "add",
    };
  },
  created() {
    this.populateItem()
  },
  mounted(){
    this.populateItem()
  },
  components: {
    listitems
  },
  methods: {
    atc(e) {
      this.$emit("atc", e);
    },
    deleteItem(e) {
      swal({
        title: "Are you sure?",
        text:
          "Once deleted, you will not be able to recover this product data!",
        icon: "warning",
        buttons: true,
        dangerMode: true
      }).then(willDelete => {
        if (willDelete) {
          this.$emit('deleteitem', e)
        } else {
          swal("Cancelling your action...", { buttons: false, timer: 200 });
        }
      });
    },
    updateItem(e) {
      console.log(e, "di parent");
      this.mode = "upd";
      this.product = e;
      this.product.image = "";
      this.updProduct()
    },
    updProduct() {
      console.log("disini");
      this.$emit("updateitem", this.product)
    },
    cancelUpd() {
      this.product.name = "";
      this.product.image = "";
      this.product.price = null;
      this.product.stock = null;
      this.product.description = "";
      this.mode = "add";
    },
    populateItem() {
      this.$forceUpdate();
      this.$emit("populateitems", true);
    },
    newProduct() {
      console.log("input produk");
      if (this.product.image === null) {
        this.$swal("Please add product image");
      } else if (
        this.product.name === "" ||
        this.product.image === "" ||
        this.product.price === null ||
        this.product.price <= 0 ||
        this.product.stock === null ||
        this.product.stock < 0 ||
        this.product.description === ""
      ) {
        this.$swal("Please input valid product ino");
      } else {
        swal("Upload Your Image...", {
          buttons: false,
          timer: 500
        });

        const blob = new Blob([this.product.image], {
          type: this.product.image.type
        });

        const formdata = new FormData();

        formdata.append("image", blob);

        this.$axios({
          method: "post",
          url: "http://35.240.223.244/uploadimg",
          headers: {
            token: localStorage.getItem("token"),
            id: localStorage.getItem("user")
          },
          data: formdata
        })
          .then(({ data }) => {
            this.product.image = data;
            swal("Adding new Product to database...", {
              buttons: false,
              timer: 500
            });
            this.$axios({
              method: "post",
              url: "http://35.240.223.244/product",
              headers: {
                id: localStorage.getItem("user"),
                token: localStorage.getItem("token")
              },
              data: {
                name: this.product.name,
                image: this.product.image,
                price: this.product.price,
                stock: this.product.stock,
                description: this.product.description
              }
            })
              .then(({ data }) => {
                this.cancelUpd();
                this.populateItem()
                console.log("created => " + JSON.stringify(data));
                this.$swal("Success", "Product Added", "success");
              })
              .catch(err => {
                console.log("error di db");
                this.cancelUpd();
                console.log(err);
              });
          })
          .catch(({ response }) => {
            this.cancelUpd();
            this.$swal(
              "Error Status : " + String(response.status),
              response.data.message,
              "error"
            );
          });
      }
    },
    previewFile(e) {
      this.product.image = e.target.files[0];
      console.log(this.product.image);
    }
  }
};
</script>
