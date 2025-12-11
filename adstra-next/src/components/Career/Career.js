"use client";
import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";

export default function Career() {
  return (
    <section
      style={{
        backgroundColor: "#000",
        color: "#fff",
        minHeight: "100vh",
        padding: "60px 0",
        marginTop: "80px",
      }}
    >
      <Container>
        {/* Header Section */}
        <Row className="text-center mb-5">
          <Col>
            <h1 style={{ fontWeight: "bold", color: "#FFD700" }}>
              Join Our Team
            </h1>
            <p
              style={{ fontSize: "18px", maxWidth: "700px", margin: "0 auto" }}
            >
              At <span style={{ color: "#FFD700" }}>Adstra Digital</span>, we
              believe in innovation, creativity, and building a future where
              technology empowers businesses. Explore career opportunities with
              us and grow your career in a dynamic environment.
            </p>
          </Col>
        </Row>

        {/* Why Work With Us Section */}
        <Row className="mb-5">
          <Col md={6}>
            <h2 style={{ color: "#FFD700" }}>Why Work With Us?</h2>
            <ul style={{ fontSize: "16px", lineHeight: "1.8" }}>
              <li> - Work on cutting-edge digital solutions</li>
              <li> - Collaborative and innovative culture</li>
              <li> - Continuous learning & career growth</li>
              <li> - Work with global brands and clients</li>
              <li> - Fun workplace with team-building activities</li>
            </ul>
          </Col>
          <Col md={6}>
            <img
              src="https://adstradigital.com/media/team/carrer-office.jpg"
              alt="Career at Adstra Digital"
              className="img-fluid rounded shadow"
              style={{ height: "220px", width: "400px" }}
            />
          </Col>
        </Row>

        {/* Open Positions */}
        <Row className="text-center mb-4">
          <Col>
            <h2 style={{ color: "#FFD700" }}>Current Openings</h2>
            <p>
              Find the right opportunity and become a part of our growing team.
            </p>
          </Col>
        </Row>

        <Row>
          {[
            {
              title: "Python Developer Intern",
              desc: " Sponsored by you, Powered by us  Build responsive and modern web applications using React & Next.js.",
              location: "Kozhikode, India",
              phone: "+91 9744779574",
              email: "info.adstradigital@gmail.com",
            },
            {
              title: "Marketing Executive",
              desc: "Plan and execute marketing strategies, manage campaigns, and generate leads.",
              location: "Kozhikode, India",
              phone: "+91 9744779574",
              email: "info.adstradigital@gmail.com",
            },
          ].map((job, index) => (
            <Col md={4} className="mb-4" key={index}>
              <Card
                style={{
                  backgroundColor: "#111",
                  color: "#fff",
                  border: "1px solid #FFD700",
                  borderRadius: "12px",
                  minHeight: "250px",
                }}
                className="shadow-sm"
              >
                <Card.Body>
                  <Card.Title style={{ color: "#FFD700", fontWeight: "bold" }}>
                    {job.title}
                  </Card.Title>
                  <Card.Text>{job.desc}</Card.Text>
                  <p style={{ fontSize: "14px", opacity: 0.8 }}>
                    📍 {job.location}
                  </p>

                  <hr style={{ borderColor: "#FFD700" }} />

                  <p style={{ marginBottom: "5px" }}>
                    📧{" "}
                    <a
                      href={`mailto:${job.email}`}
                      style={{ color: "#FFD700", textDecoration: "none" }}
                    >
                      {job.email}
                    </a>
                  </p>
                  <p>
                    📞{" "}
                    <a
                      href={`tel:${job.phone}`}
                      style={{ color: "#FFD700", textDecoration: "none" }}
                    >
                      {job.phone}
                    </a>
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Call to Action */}
        <Row className="text-center mt-5">
          <Col>
            <h2 style={{ color: "#FFD700" }}>Didn’t Find Your Role?</h2>
            <p>
              We’re always looking for talented people. Share your resume with
              us at{" "}
              <a
                href="mailto:info.adstradigital@gmail.com"
                style={{ color: "#FFD700" }}
              >
                info.adstradigital@gmail.com{" "}
              </a>{" "}
              and we’ll reach out when the right opportunity comes up.
            </p>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
