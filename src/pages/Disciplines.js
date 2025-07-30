import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, InputGroup, Modal, Table, Alert } from 'react-bootstrap';
import iconssearch from '../Resources/iconssearch.png';
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import iconx from '../Resources/iconx.png';
import iconsedit from '../Resources/iconsedit.png';
import iconsdelete from '../Resources/iconsdelete.png';
import iconsadd from '../Resources/iconsadd.png';
import { useUser } from './UserContext';


const DisciplinesManagement = () => {
  const [disciplines, setDisciplines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { account } = useUser();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; 
  
  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "X-USER-EMAIL": account && account.username ? account.username : ""
    };
  };




  
  useEffect(() => {
    // if (!account) return; 
    // fetchDisciplines();
  });

  const fetchDisciplines = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}?entity=disciplines`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch disciplines.');
      const data = await response.json();
      setDisciplines(data);
      setIsLoading(false);
    } catch (err) {
      // setError(err.message);
      // redirectToMIOG();
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discipline?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}?entity=disciplines`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          DisciplineID: id,
          deleted_by: account?.name 
        })
      });


      if (!response.ok) {
        const errorData = await response.json();
        console.log('Delete Error Data:', errorData); 
        throw new Error(errorData.message || 'Failed to delete discipline.');
      }
      
      setDisciplines(disciplines.filter(d => d.DisciplineID !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const openModal = (discipline = null) => {
    setEditing(discipline);
    setName(discipline ? discipline.DisciplineName : '');
    setShowModal(true);
  };

  const closeModal = () => {
    setEditing(null);
    setName('');
    setShowModal(false);
    setError(null);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        DisciplineName: name,
        ...(editing
          ? { DisciplineID: editing.DisciplineID, updated_by: account.name }
          : { created_by: account.name }),
      };
      const method = editing ? 'PUT' : 'POST';
      const response = await fetch(`${API_BASE_URL}?entity=disciplines`, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editing ? 'update' : 'create'} discipline.`);
      }

      await fetchDisciplines();
      closeModal();
    } catch (err) {
      console.error('Error:', err);
      // setError(err.message);
    }
  };

  const filteredDisciplines = disciplines.filter(d => {
    const search = searchTerm.toLowerCase();
    return (
      (d.DisciplineName || '').toLowerCase().includes(search) 
    );
  });

  return (
    <>
      <Navbar expand="lg" style={{ backgroundColor: "#1e73be"}} className="py-2">
        <Container fluid>
          <Navbar.Brand  className="me-auto" style={{ color: "#ffffff", fontWeight: "bold" }}>
            Manage Specialties
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="index.html#/home">
                <img 
                  src={iconx} 
                  alt="Search" 
                  style={{ width: '29px', height: '29px' }}
                />
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid className="px-3 py-0 min-vh-100 d-flex flex-column" >
        <Row className="mb-2">
          <Col>
            {/* <h2 className="text-center" style={{ color: "#c4512a"}}>Manage Disciplines</h2> */}
            <p className="text-center text-muted" style={{ marginTop: '4em',marginBottom: '1em', fontWeight: "400" }}>Add, edit, or delete specialties.</p>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="justify-content-center mb-3">
          <Col md={6}>
            <InputGroup>
              <Form.Control
                placeholder="Search specialties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  transition: "all 0.3s",
                  border: "1px solid #1e73be",
                  padding: "10px",
                  paddingLeft: "40px",
                  marginLeft: "110px",
                }}
              />
              <InputGroup.Text>
                <img 
                  src={iconssearch} 
                  alt="Search" 
                  style={{ width: '20px', height: '20px' }}
                />
              </InputGroup.Text>
            </InputGroup>
          </Col>
          <Col md={6} className="text-md-end mt-2 mt-md-0">
            <Button style={{ backgroundColor: "green", marginRight: '180px'}} onClick={() => openModal()}>
              <img 
                src={iconsadd} 
                alt="Add" 
                style={{ width: '20px', height: '20px', marginRight: '5px' }}
              />
              Add Specialty
            </Button>
          </Col>
        </Row>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <Row>
            <Col className="p-4" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>
              {filteredDisciplines.length > 0 ? (
                <div className="table-responsive" style={{ border: '0.5px solid #dee2e6', borderTop: 0, padding: '50px' }}>
                  <Table striped hover >
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Specialty</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDisciplines.map((discipline, index) => (
                        <tr key={discipline.DisciplineID}>
                          <td>{index + 1}</td>
                          <td>{discipline.DisciplineName}</td>
                          <td className="text-end">
                            <Button 
                              style={{ backgroundColor: "#1e73be"}}
                              size="sm" 
                              className="me-2" 
                              onClick={() => openModal(discipline)}
                            >
                              <img src={iconsedit} alt="Edit" style={{ width: '26px', height: '20px' }} />
                              Edit
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleDelete(discipline.DisciplineID)}
                            ><img 
                            src={iconsdelete} 
                            alt="Add" 
                            style={{ width: '20px', height: '20px', marginRight: '5px' }}
                          />
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-center">No Specialties found.</p>
              )}
            </Col>
          </Row>
        )}

        <Modal show={showModal} onHide={closeModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editing ? 'Edit Discipline' : 'Add New Discipline'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Discipline Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Specialty name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    transition: "all 0.3s",
                    border: "1px solid #1e73be",
                    padding: "10px",
                  }}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={closeModal}>Cancel</Button>
              <Button style={{ backgroundColor: "#1e73be"}} type="submit">
                {editing ? 'Save Changes' : 'Create Discipline'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </>
  );
};

export default DisciplinesManagement;