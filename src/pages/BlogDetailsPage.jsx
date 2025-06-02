import React from "react";
import NavBar from "../components/NavBar/navbar";
import Footer from "../components/Footer/Footer";
import BlogDetail from "../components/BlogDetails/BlogDetails";


function BlogDetailsPage() {
    return (
        <div>
            <NavBar />
            <BlogDetail />
            <Footer />
        </div>
    )
}

export default BlogDetailsPage;