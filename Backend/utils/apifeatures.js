class apifeatures{
    constructor(Model,query){
        this.Model = Model,
        this.query = query
    }
    filer(){
        const queryobj = {...this.query}
        const excludefield =['page','sort','limit','fields']
        excludefield.forEach((ele)=>delete queryobj[ele])

        let queryString = JSON.stringify(queryobj)
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        this.Model =  this.Model.find(JSON.parse(queryString)) 
        return this;
    }
    sort(){
        if(this.query.sort){
            const sortby = this.query.sort.split(',').join(' ')
            this.Model = this.Model.sort(sortby)
        }else{
            this.Model = this.Model.sort('-createdAt')
        }
        return this
    }
    paginate(){
        const page = this.query.page*1 ||1;
        const limit = this.query.limit*1 || 100;
        const skip = (page-1)*limit;
        this.Model = this.Model.skip(skip).limit(limit);
        return this;
    }
}

module.exports = apifeatures