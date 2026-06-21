import uuid
import random
import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.db import transaction

from accounts.models import HMSUser, LoginAuditLog
from departments.models import Department
from doctors.models import Doctor
from patients.models import Patient
from appointments.models import Appointment, DoctorAvailability
from clinical.models import Vitals, MedicalRecord, DiagnosticOrder, DiagnosticResult
from pharmacy.models import PrescriptionDispense
from billing.models import Invoice
from invitations.models import StaffInvite
from applications.models import DoctorApplication
from roster.models import DutyRoster


class Command(BaseCommand):
    help = "Seeds the local database with rich, realistic mock data for AI-HMS demo."

    def handle(self, *args, **options):
        self.stdout.write("Starting database seeding process...")

        try:
            self.clear_existing_data()
            
            departments = self.seed_departments()
            applications = self.seed_doctor_applications()
            staff_users = self.seed_staff_users(departments)
            patients = self.seed_patient_users()
            self.seed_doctor_availabilities(staff_users['doctors'])
            appointments = self.seed_appointments(patients, staff_users['doctors'])
            vitals = self.seed_vitals(appointments, staff_users['nurse1'])
            medical_records = self.seed_medical_records(appointments, staff_users['doctors'])
            self.seed_billing_invoices(appointments, patients)
            self.seed_prescription_dispenses(medical_records, staff_users['pharmacist1'])
            self.seed_diagnostics(
                appointments,
                staff_users['doctors'],
                patients,
                staff_users['labtech'],
                staff_users['radiologist']
            )
            self.seed_staff_invites(departments)
            self.seed_login_audit_logs(staff_users['admin'], staff_users['doctors'][0])
            self.seed_rosters(staff_users, departments)

            self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Seeding failed: {str(e)}"))
            raise e

    def clear_existing_data(self):
        self.stdout.write("Clearing existing data...")
        
        # Delete in order of dependencies to avoid foreign key violations
        DutyRoster.objects.all().delete()
        LoginAuditLog.objects.all().delete()
        StaffInvite.objects.all().delete()
        Invoice.objects.all().delete()
        PrescriptionDispense.objects.all().delete()
        DiagnosticResult.objects.all().delete()
        DiagnosticOrder.objects.all().delete()
        MedicalRecord.objects.all().delete()
        Vitals.objects.all().delete()
        Appointment.objects.all().delete()
        DoctorAvailability.objects.all().delete()
        Doctor.objects.all().delete()
        Patient.objects.all().delete()
        DoctorApplication.objects.all().delete()
        HMSUser.objects.all().delete()
        Department.objects.all().delete()

        self.stdout.write("Existing data cleared.")

    def seed_departments(self):
        self.stdout.write("Seeding departments...")
        
        dept_data = [
            {
                "name": "Cardiology",
                "code": "CARD",
                "description": "Diagnosis, assessment, and treatment of heart conditions and cardiovascular diseases.",
                "location": "Building A, 2nd Floor",
                "contact_number": "021-555-0121",
                "is_active": True
            },
            {
                "name": "Pediatrics",
                "code": "PEDS",
                "description": "Comprehensive medical care and treatment for infants, children, and adolescents.",
                "location": "Building B, 1st Floor",
                "contact_number": "021-555-0122",
                "is_active": True
            },
            {
                "name": "Emergency Medicine",
                "code": "EMER",
                "description": "Immediate, 24/7 care and stabilization for acute illnesses, trauma, and medical emergencies.",
                "location": "Main Building, Ground Floor",
                "contact_number": "021-555-0100",
                "is_active": True
            },
            {
                "name": "Pharmacy",
                "code": "PHARM",
                "description": "In-patient and out-patient prescription fulfillment, dosage counseling, and drug distribution.",
                "location": "Main Building, Lobby Level",
                "contact_number": "021-555-0111",
                "is_active": True
            },
            {
                "name": "Administration",
                "code": "ADMIN",
                "description": "Hospital governance, IT operations, resource allocation, and general administration.",
                "location": "Building C, 3rd Floor",
                "contact_number": "021-555-0150",
                "is_active": True
            },
            {
                "name": "Laboratory",
                "code": "LAB",
                "description": "Diagnostic testing services including blood analysis, pathology, and clinical chemistry.",
                "location": "Building A, 1st Floor",
                "contact_number": "021-555-0130",
                "is_active": True
            },
            {
                "name": "Radiology",
                "code": "RAD",
                "description": "Imaging diagnostics including X-Ray, CT, MRI, and Ultrasound scans.",
                "location": "Building A, Ground Floor",
                "contact_number": "021-555-0140",
                "is_active": True
            }
        ]

        departments = {}
        for data in dept_data:
            dept = Department.objects.create(**data)
            departments[dept.code] = dept
        
        self.stdout.write(f"Seeded {len(departments)} departments.")
        return departments

    def seed_doctor_applications(self):
        self.stdout.write("Seeding doctor applications...")
        
        app_data = [
            {
                "full_name": "Dr. Sarah Connor",
                "email": "doctor1@test.com",
                "phone": "0300-9876543",
                "dob": datetime.date(1985, 4, 12),
                "gender": DoctorApplication.Gender.FEMALE,
                "city": "Karachi",
                "specialization": "Cardiology",
                "pmdc_number": "PMDC-12345-C",
                "experience_years": 12,
                "current_hospital": "National Heart Institute",
                "status": DoctorApplication.Status.APPROVED,
                "pmdc_certificate": "certificates/dummy1.pdf",
                "cnic_document": "cnic/dummy1.pdf"
            },
            {
                "full_name": "Dr. Bruce Banner",
                "email": "bruce.banner@test.com",
                "phone": "0311-2223334",
                "dob": datetime.date(1978, 8, 18),
                "gender": DoctorApplication.Gender.MALE,
                "city": "Lahore",
                "specialization": "Endocrinology",
                "pmdc_number": "PMDC-88888-E",
                "experience_years": 18,
                "current_hospital": "Bio-Tech Research Center",
                "status": DoctorApplication.Status.PENDING,
                "pmdc_certificate": "certificates/dummy2.pdf",
                "cnic_document": "cnic/dummy2.pdf"
            },
            {
                "full_name": "Dr. Jack Torrance",
                "email": "jack.torrance@test.com",
                "phone": "0322-9990001",
                "dob": datetime.date(1975, 11, 23),
                "gender": DoctorApplication.Gender.MALE,
                "city": "Murree",
                "specialization": "Psychiatry",
                "pmdc_number": "PMDC-66666-P",
                "experience_years": 15,
                "current_hospital": "Overlook Wellness Clinic",
                "status": DoctorApplication.Status.REJECTED,
                "rejection_reason": "Incomplete PMDC verification documents and history of unstable references.",
                "pmdc_certificate": "certificates/dummy3.pdf",
                "cnic_document": "cnic/dummy3.pdf"
            }
        ]

        applications = []
        for data in app_data:
            app = DoctorApplication.objects.create(**data)
            applications.append(app)

        self.stdout.write(f"Seeded {len(applications)} doctor onboarding applications.")
        return applications

    def seed_staff_users(self, departments):
        self.stdout.write("Seeding staff users...")
        
        password = make_password("password123")
        
        # 1. Admin
        admin = HMSUser.objects.create(
            email="admin@test.com",
            password=password,
            full_name="Hospital Administrator",
            role=HMSUser.Role.ADMIN,
            department=departments["ADMIN"],
            is_active=True,
            is_staff=True,
            is_superuser=True,
            employee_id="EMP-ADMIN-001",
            phone="0300-1112223"
        )

        # 2. Doctors
        today = datetime.date.today()
        doctors_to_create = [
            {
                "email": "doctor1@test.com", # Matches the approved application
                "full_name": "Dr. Sarah Connor",
                "department": departments["CARD"],
                "employee_id": "EMP-DOC-001",
                "phone": "0300-9876543",
                "specialization": "Cardiology",
                "consultation_fee": 1500.00,
                "bio": "Dr. Sarah Connor is a veteran cardiologist specializing in non-invasive imaging, cardiac rehabilitation, and coronary artery disease prevention.",
                "pmdc_expiry_date": today + datetime.timedelta(days=45),  # Expiring soon
                "license_status": "ACTIVE",
            },
            {
                "email": "doctor2@test.com",
                "full_name": "Dr. John Watson",
                "department": departments["PEDS"],
                "employee_id": "EMP-DOC-002",
                "phone": "0321-5556667",
                "specialization": "Pediatrics",
                "consultation_fee": 1200.00,
                "bio": "Dr. Watson offers comprehensive primary care services to pediatric patients. He focuses on childhood developmental milestones, asthma management, and adolescent wellness.",
                "pmdc_expiry_date": today + datetime.timedelta(days=180),  # Valid
                "license_status": "ACTIVE",
            },
            {
                "email": "doctor3@test.com",
                "full_name": "Dr. Gregory House",
                "department": departments["EMER"],
                "employee_id": "EMP-DOC-003",
                "phone": "0333-8889990",
                "specialization": "Emergency Medicine",
                "consultation_fee": 2000.00,
                "bio": "Dr. House is a seasoned emergency physician who excels under high-stress clinical conditions. His areas of interest include critical care resuscitation and diagnostics.",
                "pmdc_expiry_date": today - datetime.timedelta(days=10),  # Expired
                "license_status": "EXPIRED",
            }
        ]

        doctors = []
        for doc_info in doctors_to_create:
            user = HMSUser.objects.create(
                email=doc_info["email"],
                password=password,
                full_name=doc_info["full_name"],
                role=HMSUser.Role.DOCTOR,
                department=doc_info["department"],
                is_active=True,
                is_staff=False,
                employee_id=doc_info["employee_id"],
                phone=doc_info["phone"]
            )
            # The signal create_user_profile automatically creates a Doctor profile.
            # Retrieve and update it with extra fields.
            doc_profile = Doctor.objects.get(user=user)
            doc_profile.specialization = doc_info["specialization"]
            doc_profile.consultation_fee = doc_info["consultation_fee"]
            doc_profile.bio = doc_info["bio"]
            doc_profile.is_available = True
            doc_profile.pmdc_expiry_date = doc_info.get("pmdc_expiry_date")
            doc_profile.license_status = doc_info.get("license_status", "ACTIVE")
            doc_profile.save()
            doctors.append(doc_profile)

        # 3. Nurses
        nurse1 = HMSUser.objects.create(
            email="nurse1@test.com",
            password=password,
            full_name="Nurse Florence Nightingale",
            role=HMSUser.Role.NURSE,
            department=departments["CARD"],
            is_active=True,
            employee_id="EMP-NUR-001",
            phone="0300-5551111"
        )
        nurse2 = HMSUser.objects.create(
            email="nurse2@test.com",
            password=password,
            full_name="Nurse Clara Barton",
            role=HMSUser.Role.NURSE,
            department=departments["EMER"],
            is_active=True,
            employee_id="EMP-NUR-002",
            phone="0300-5552222"
        )

        # 4. Pharmacist
        pharmacist1 = HMSUser.objects.create(
            email="pharmacist1@test.com",
            password=password,
            full_name="Pharmacist Alexander Fleming",
            role=HMSUser.Role.PHARMACIST,
            department=departments["PHARM"],
            is_active=True,
            employee_id="EMP-PHA-001",
            phone="0300-5553333"
        )

        # 5. Receptionist
        receptionist1 = HMSUser.objects.create(
            email="receptionist1@test.com",
            password=password,
            full_name="Receptionist Jane Hudson",
            role=HMSUser.Role.RECEPTIONIONIST if hasattr(HMSUser.Role, 'RECEPTIONIONIST') else HMSUser.Role.RECEPTIONIST,
            department=departments["ADMIN"],
            is_active=True,
            employee_id="EMP-REC-001",
            phone="0300-5554444"
        )

        # 6. Lab Technician
        labtech = HMSUser.objects.create(
            email="labtech@test.com",
            password=password,
            full_name="Lab Technician Robert Koch",
            role=HMSUser.Role.LAB_TECHNICIAN,
            department=departments["LAB"],
            is_active=True,
            employee_id="EMP-LAB-001",
            phone="0300-5555555"
        )

        # 7. Radiologist
        radiologist = HMSUser.objects.create(
            email="radiologist@test.com",
            password=password,
            full_name="Radiologist Marie Curie",
            role=HMSUser.Role.RADIOLOGIST,
            department=departments["RAD"],
            is_active=True,
            employee_id="EMP-RAD-001",
            phone="0300-5556666"
        )

        self.stdout.write("Seeded admin, 3 doctors, 2 nurses, 1 pharmacist, 1 receptionist, 1 lab technician, and 1 radiologist.")
        return {
            "admin": admin,
            "doctors": doctors,
            "nurse1": nurse1,
            "nurse2": nurse2,
            "pharmacist1": pharmacist1,
            "receptionist1": receptionist1,
            "labtech": labtech,
            "radiologist": radiologist
        }

    def seed_patient_users(self):
        self.stdout.write("Seeding patient users and profiles...")
        
        password = make_password("password123")
        
        patient_data = [
            {
                "email": "patient1@test.com",
                "full_name": "Alice Smith",
                "phone": "0300-1234567",
                "dob": datetime.date(1990, 5, 15),
                "gender": "Female",
                "cnic": "35202-1234567-1",
                "emergency_contact_name": "Bob Smith",
                "emergency_contact_relationship": "Spouse",
                "emergency_contact_phone": "0300-7654321"
            },
            {
                "email": "patient2@test.com",
                "full_name": "Charlie Brown",
                "phone": "0321-7654321",
                "dob": datetime.date(1995, 10, 20),
                "gender": "Male",
                "cnic": "35202-7654321-1",
                "emergency_contact_name": "Sally Brown",
                "emergency_contact_relationship": "Sister",
                "emergency_contact_phone": "0321-1234567"
            },
            {
                "email": "patient3@test.com",
                "full_name": "Diana Prince",
                "phone": "0333-1112223",
                "dob": datetime.date(1988, 8, 8),
                "gender": "Female",
                "cnic": "35202-1112223-1",
                "emergency_contact_name": "Hippolyta Prince",
                "emergency_contact_relationship": "Mother",
                "emergency_contact_phone": "0333-9990000"
            },
            {
                "email": "patient4@test.com",
                "full_name": "Evan Wright",
                "phone": "0345-4445556",
                "dob": datetime.date(2000, 12, 1),
                "gender": "Male",
                "cnic": "35202-4445556-1",
                "emergency_contact_name": "Arthur Wright",
                "emergency_contact_relationship": "Father",
                "emergency_contact_phone": "0345-9998887"
            },
            {
                "email": "patient5@test.com",
                "full_name": "Fiona Gallagher",
                "phone": "0312-9998887",
                "dob": datetime.date(1997, 3, 25),
                "gender": "Female",
                "cnic": "35202-9998887-1",
                "emergency_contact_name": "Lip Gallagher",
                "emergency_contact_relationship": "Brother",
                "emergency_contact_phone": "0312-1112222"
            }
        ]

        patients = []
        for p_info in patient_data:
            user = HMSUser.objects.create(
                email=p_info["email"],
                password=password,
                full_name=p_info["full_name"],
                role=HMSUser.Role.PATIENT,
                is_active=True,
                is_staff=False,
                phone=p_info["phone"],
                dob=p_info["dob"],
                gender=p_info["gender"],
                cnic=p_info["cnic"],
                emergency_contact_name=p_info["emergency_contact_name"],
                emergency_contact_relationship=p_info["emergency_contact_relationship"],
                emergency_contact_phone=p_info["emergency_contact_phone"]
            )
            # The signal create_user_profile automatically creates a Patient profile.
            # Retrieve it to build the list
            patient_profile = Patient.objects.get(user=user)
            patients.append(patient_profile)

        self.stdout.write(f"Seeded {len(patients)} patients with auto-generated MRNs.")
        return patients

    def seed_doctor_availabilities(self, doctors):
        self.stdout.write("Seeding doctor availabilities...")
        
        # Monday (0), Wednesday (2), Friday (4) slots
        avail_count = 0
        for doc in doctors:
            for day in [0, 2, 4]:
                DoctorAvailability.objects.create(
                    doctor=doc,
                    day_of_week=day,
                    start_time=datetime.time(9, 0),
                    end_time=datetime.time(13, 0),
                    slot_duration=20
                )
                DoctorAvailability.objects.create(
                    doctor=doc,
                    day_of_week=day,
                    start_time=datetime.time(14, 0),
                    end_time=datetime.time(17, 0),
                    slot_duration=20
                )
                avail_count += 2

        self.stdout.write(f"Seeded {avail_count} availability shifts.")

    def seed_appointments(self, patients, doctors):
        self.stdout.write("Seeding appointments...")
        
        today = timezone.now().date()
        yesterday = today - datetime.timedelta(days=1)
        two_days_ago = today - datetime.timedelta(days=2)
        tomorrow = today + datetime.timedelta(days=1)
        next_week = today + datetime.timedelta(days=7)

        app_data = [
            # Past / Completed Appointments (to support medical records)
            {
                "patient": patients[0], # Alice Smith
                "doctor": doctors[0], # Sarah Connor (Cardiology)
                "date": two_days_ago,
                "start_time": datetime.time(10, 0),
                "end_time": datetime.time(10, 20),
                "status": "COMPLETED",
                "reason": "Routine cardiac checkup following minor chest tightness."
            },
            {
                "patient": patients[1], # Charlie Brown
                "doctor": doctors[1], # John Watson (Pediatrics)
                "date": yesterday,
                "start_time": datetime.time(11, 0),
                "end_time": datetime.time(11, 20),
                "status": "COMPLETED",
                "reason": "Persistent dry cough and mild wheezing."
            },
            {
                "patient": patients[2], # Diana Prince
                "doctor": doctors[2], # Gregory House (Emergency)
                "date": yesterday,
                "start_time": datetime.time(15, 0),
                "end_time": datetime.time(15, 20),
                "status": "COMPLETED",
                "reason": "Severe throat infection, difficulty swallowing."
            },
            # Pending / In-Queue Appointments for Today
            {
                "patient": patients[0], # Alice Smith
                "doctor": doctors[0], # Sarah Connor
                "date": today,
                "start_time": datetime.time(9, 30),
                "end_time": datetime.time(9, 50),
                "status": "PENDING",
                "reason": "Follow-up consultation for blood pressure monitoring. (CRITICAL VITALS TEST USER)"
            },
            {
                "patient": patients[3], # Evan Wright
                "doctor": doctors[1], # John Watson
                "date": today,
                "start_time": datetime.time(10, 30),
                "end_time": datetime.time(10, 50),
                "status": "PENDING",
                "reason": "General checkup and booster vaccination inquiry."
            },
            {
                "patient": patients[4], # Fiona Gallagher
                "doctor": doctors[2], # Gregory House
                "date": today,
                "start_time": datetime.time(14, 0),
                "end_time": datetime.time(14, 20),
                "status": "PENDING",
                "reason": "Unexplained acute headaches and dizziness."
            },
            # Confirmed / Upcoming Appointments
            {
                "patient": patients[1], # Charlie Brown
                "doctor": doctors[0], # Sarah Connor
                "date": tomorrow,
                "start_time": datetime.time(10, 0),
                "end_time": datetime.time(10, 20),
                "status": "CONFIRMED",
                "reason": "Preventative cardiovascular health advice."
            },
            {
                "patient": patients[2], # Diana Prince
                "doctor": doctors[1], # John Watson
                "date": tomorrow,
                "start_time": datetime.time(14, 30),
                "end_time": datetime.time(14, 50),
                "status": "CONFIRMED",
                "reason": "Pediatric consultation for immunization schedule."
            },
            {
                "patient": patients[3], # Evan Wright
                "doctor": doctors[2], # Gregory House
                "date": next_week,
                "start_time": datetime.time(11, 0),
                "end_time": datetime.time(11, 20),
                "status": "CONFIRMED",
                "reason": "Chronic back pain checkup."
            },
            # Cancelled Appointments
            {
                "patient": patients[4], # Fiona Gallagher
                "doctor": doctors[0], # Sarah Connor
                "date": yesterday,
                "start_time": datetime.time(16, 0),
                "end_time": datetime.time(16, 20),
                "status": "CANCELLED",
                "reason": "Patient had transport issues."
            }
        ]

        appointments = []
        for data in app_data:
            appt = Appointment.objects.create(**data)
            appointments.append(appt)

        self.stdout.write(f"Seeded {len(appointments)} appointments.")
        return appointments

    def seed_vitals(self, appointments, nurse):
        self.stdout.write("Seeding clinical vitals...")
        
        # We need to add vitals to:
        # - The completed appointments (so records have baseline vitals)
        # - The pending appointments (which represents the current consult queue)
        
        vitals_data = [
            # Completed 1: Alice Smith
            {
                "appointment": appointments[0],
                "patient": appointments[0].patient,
                "blood_pressure": "135/85",
                "heart_rate": 88,
                "temperature": Decimal("98.4"),
                "spo2": 97,
                "respiratory_rate": 18,
                "weight": Decimal("68.50"),
                "height": Decimal("164.00"),
                "recorded_by": nurse
            },
            # Completed 2: Charlie Brown
            {
                "appointment": appointments[1],
                "patient": appointments[1].patient,
                "blood_pressure": "115/75",
                "heart_rate": 95,
                "temperature": Decimal("99.1"),
                "spo2": 96,
                "respiratory_rate": 20,
                "weight": Decimal("35.00"),
                "height": Decimal("140.00"),
                "recorded_by": nurse
            },
            # Completed 3: Diana Prince
            {
                "appointment": appointments[2],
                "patient": appointments[2].patient,
                "blood_pressure": "120/80",
                "heart_rate": 72,
                "temperature": Decimal("100.8"), # Mild fever
                "spo2": 99,
                "respiratory_rate": 16,
                "weight": Decimal("62.00"),
                "height": Decimal("175.00"),
                "recorded_by": nurse
            },
            # PENDING Today 1 (CRITICAL USER): Alice Smith
            # Triggering tachycardia (HR > 100), hypertension (BP > 140), fever (> 100.4), and hypoxia (SpO2 < 95%)
            {
                "appointment": appointments[3],
                "patient": appointments[3].patient,
                "blood_pressure": "155/95", # Hypertension flag
                "heart_rate": 112,         # Tachycardia flag
                "temperature": Decimal("101.5"),      # Fever flag
                "spo2": 91,                # Hypoxia critical flag!
                "respiratory_rate": 24,
                "weight": Decimal("70.00"),
                "height": Decimal("165.00"),
                "recorded_by": nurse
            },
            # PENDING Today 2: Evan Wright (NORMAL Vitals)
            {
                "appointment": appointments[4],
                "patient": appointments[4].patient,
                "blood_pressure": "118/78",
                "heart_rate": 68,
                "temperature": Decimal("98.2"),
                "spo2": 98,
                "respiratory_rate": 16,
                "weight": Decimal("78.00"),
                "height": Decimal("180.00"),
                "recorded_by": nurse
            },
            # PENDING Today 3: Fiona Gallagher (NORMAL Vitals)
            {
                "appointment": appointments[5],
                "patient": appointments[5].patient,
                "blood_pressure": "122/82",
                "heart_rate": 80,
                "temperature": Decimal("98.6"),
                "spo2": 99,
                "respiratory_rate": 18,
                "weight": Decimal("54.00"),
                "height": Decimal("160.00"),
                "recorded_by": nurse
            }
        ]

        vitals = []
        for data in vitals_data:
            vit = Vitals.objects.create(**data)
            vitals.append(vit)

        self.stdout.write(f"Seeded {len(vitals)} vitals logs, including 1 high-priority triage case.")
        return vitals

    def seed_medical_records(self, appointments, doctors):
        self.stdout.write("Seeding medical records...")
        
        # Medical records link to COMPLETED appointments
        # Record 1: Alice Smith with Dr. Sarah Connor
        # Record 2: Charlie Brown with Dr. John Watson
        # Record 3: Diana Prince with Dr. Gregory House

        records_data = [
            {
                "patient": appointments[0].patient,
                "doctor": doctors[0],
                "appointment": appointments[0],
                "diagnosis": "Stage 1 Essential Hypertension",
                "treatment_plan": "Initiate low-sodium diet, regular aerobic exercise (30 mins daily). Monitor BP at home twice daily and return for follow-up in 2 days.",
                "prescription": "Lisinopril 10mg - 1 tablet daily in the morning\nHydrochlorothiazide 12.5mg - 1 tablet daily in the morning",
                "notes": "Patient reports family history of cardiovascular illnesses. Stated adherence to medication is good, but stress levels at work are elevated."
            },
            {
                "patient": appointments[1].patient,
                "doctor": doctors[1],
                "appointment": appointments[1],
                "diagnosis": "Mild Persistent Pediatric Asthma",
                "treatment_plan": "Avoid known allergens. Maintain high hydration levels. Monitor asthma symptoms using peak flow meter.",
                "prescription": "Albuterol Inhaler 90mcg - 2 puffs every 4 to 6 hours as needed for wheezing\nMontelukast 5mg chewable - 1 tablet nightly before bed",
                "notes": "Lungs demonstrate bilateral expiratory wheezes. Mother counselled on trigger avoidance and proper inhaler spacer technique."
            },
            {
                "patient": appointments[2].patient,
                "doctor": doctors[2],
                "appointment": appointments[2],
                "diagnosis": "Acute Streptococcal Pharyngitis",
                "treatment_plan": "Complete full 10-day course of oral antibiotics. Rest and warm fluid intake. Return if breathing difficulty or throat swelling occurs.",
                "prescription": "Amoxicillin 500mg - 1 capsule three times daily for 10 days\nParacetamol 500mg - 1 tablet every 6 hours as needed for pain and fever",
                "notes": "Erythematous tonsils with white exudate present. Rapid strep test confirmed positive. Fluid intake strongly encouraged."
            }
        ]

        medical_records = []
        for data in records_data:
            rec = MedicalRecord.objects.create(**data)
            medical_records.append(rec)

        self.stdout.write(f"Seeded {len(medical_records)} medical records.")
        return medical_records

    def seed_billing_invoices(self, appointments, patients):
        self.stdout.write("Seeding billing invoices...")
        
        # Create invoices for all completed, pending, and confirmed appointments
        # Invoices for completed appointments are PAID, others are PENDING
        
        invoice_count = 0
        today = timezone.now()
        
        for i, appt in enumerate(appointments):
            if appt.status == "CANCELLED":
                continue

            is_paid = (appt.status == "COMPLETED")
            status = "PAID" if is_paid else "PENDING"
            method = random.choice(["CARD", "CASH", "MOBILE_PAY"]) if is_paid else None
            
            # Base fee on doctor's consultation fee + optional medicines fee
            amount = Decimal(str(appt.doctor.consultation_fee))
            if is_paid:
                decimal_val = Decimal(str(random.choice([250.00, 500.00, 1000.00])))
                amount += decimal_val
            
            inv = Invoice.objects.create(
                appointment=appt,
                patient=appt.patient,
                amount=amount,
                paid_amount=amount if is_paid else Decimal("0.00"),
                payment_status=status,
                payment_method=method
            )
            
            # Distribute dates of main invoices
            days_ago = random.randint(0, 10)
            created_date = today - datetime.timedelta(days=days_ago)
            Invoice.objects.filter(id=inv.id).update(created_at=created_date)
            
            invoice_count += 1

        # Generate additional realistic historical invoices for the past 30 days
        # to ensure the Collections Trend (Last 30 Days) chart has rich mock data.
        historical_invoice_count = 0
        for day in range(1, 30):
            created_date = today - datetime.timedelta(days=day)
            # Seed 1 to 3 invoices for this day
            num_invoices = random.randint(1, 3)
            for _ in range(num_invoices):
                patient = random.choice(patients)
                amount = Decimal(str(random.choice([1200.00, 1500.00, 2200.00, 3000.00, 4500.00])))
                method = random.choice(["CARD", "CASH", "MOBILE_PAY"])
                
                inv = Invoice.objects.create(
                    patient=patient,
                    amount=amount,
                    paid_amount=amount,
                    payment_status="PAID",
                    payment_method=method
                )
                Invoice.objects.filter(id=inv.id).update(created_at=created_date)
                historical_invoice_count += 1
                invoice_count += 1

        self.stdout.write(f"Seeded {invoice_count} billing invoices ({historical_invoice_count} historical trend records).")

    def seed_prescription_dispenses(self, medical_records, pharmacist):
        self.stdout.write("Updating automatically generated prescription dispenses...")
        
        # The post-save signal auto-creates PrescriptionDispense when a MedicalRecord with a prescription is created.
        # We find these dispenses and update some to DISPENSED (to show pharmacist logs) and keep others PENDING.
        
        dispense_records = PrescriptionDispense.objects.all()
        
        if dispense_records.exists():
            # Let's mark the first two as dispensed, and leave the last one pending
            # Alice Smith dispense: DISPENSED
            d1 = dispense_records[0]
            d1.status = 'DISPENSED'
            d1.dispensed_by = pharmacist
            d1.dispensed_at = timezone.now() - datetime.timedelta(days=1)
            d1.amount = Decimal("850.00")
            d1.notes = "Lisinopril and Hydrochlorothiazide dispensed. Counselled on daily morning administration."
            d1.save()

            # Charlie Brown dispense: DISPENSED
            if len(dispense_records) > 1:
                d2 = dispense_records[1]
                d2.status = 'DISPENSED'
                d2.dispensed_by = pharmacist
                d2.dispensed_at = timezone.now() - datetime.timedelta(hours=4)
                d2.amount = Decimal("1200.00")
                d2.notes = "Inhaler and chewable pills dispensed. Spacers demonstrated."
                d2.save()

            # Diana Prince dispense: Keep PENDING (will show up in Pharmacist's queue!)
            if len(dispense_records) > 2:
                d3 = dispense_records[2]
                d3.status = 'PENDING'
                d3.amount = Decimal("750.00")
                d3.notes = "Waiting for patient to arrive at pharmacy counter."
                d3.save()

            self.stdout.write(f"Updated {dispense_records.count()} prescription dispenses (2 Dispensed, 1 Pending).")
        else:
            self.stdout.write("No auto-generated prescription dispenses found. Verifying signals.")

    def seed_staff_invites(self, departments):
        self.stdout.write("Seeding staff invites...")
        
        now = timezone.now()
        
        inv_data = [
            # Active/valid invitation
            {
                "email": "invite.doctor@test.com",
                "role": HMSUser.Role.DOCTOR,
                "department": departments["PEDS"],
                "is_used": False,
                "expires_at": now + datetime.timedelta(days=5)
            },
            # Expired invitation
            {
                "email": "invite.nurse@test.com",
                "role": HMSUser.Role.NURSE,
                "department": departments["EMER"],
                "is_used": False,
                "expires_at": now - datetime.timedelta(days=2)
            },
            # Used invitation
            {
                "email": "doctor2@test.com", # Dr. Watson's email
                "role": HMSUser.Role.DOCTOR,
                "department": departments["PEDS"],
                "is_used": True,
                "expires_at": now + datetime.timedelta(days=3)
            }
        ]

        invites = []
        for data in inv_data:
            # Override custom expires_at by creating and then saving or setting it
            invite = StaffInvite.objects.create(
                email=data["email"],
                role=data["role"],
                department=data["department"],
                is_used=data["is_used"],
                expires_at=data["expires_at"]
            )
            invites.append(invite)

        self.stdout.write(f"Seeded {len(invites)} staff invites.")

    def seed_login_audit_logs(self, admin_user, doctor_profile):
        self.stdout.write("Seeding login audit logs...")
        
        # We create some mock security logs
        logs_data = [
            {
                "user": admin_user,
                "email_attempted": admin_user.email,
                "ip_address": "192.168.1.10",
                "login_method": "PASSWORD",
                "success": True,
                "failure_reason": None
            },
            {
                "user": doctor_profile.user,
                "email_attempted": doctor_profile.user.email,
                "ip_address": "192.168.1.15",
                "login_method": "PASSWORD",
                "success": True,
                "failure_reason": None
            },
            {
                "user": None,
                "email_attempted": "intruder@malicious.com",
                "ip_address": "203.0.113.50",
                "login_method": "PASSWORD",
                "success": False,
                "failure_reason": "Account not found or inactive."
            },
            {
                "user": admin_user,
                "email_attempted": admin_user.email,
                "ip_address": "198.51.100.12",
                "login_method": "PASSWORD",
                "success": False,
                "failure_reason": "Incorrect password credentials entered."
            }
        ]

        logs = []
        for data in logs_data:
            log = LoginAuditLog.objects.create(**data)
            logs.append(log)

        self.stdout.write(f"Seeded {len(logs)} security login audit trail records.")

    def seed_diagnostics(self, appointments, doctors, patients, labtech, radiologist):
        self.stdout.write("Seeding laboratory and radiology diagnostic orders...")

        # 1. Completed Lab Order for Alice Smith, ordered by Dr. Sarah Connor, linked to appt 0
        order1 = DiagnosticOrder.objects.create(
            patient=patients[0],
            doctor=doctors[0],
            appointment=appointments[0],
            test_name="Complete Blood Count (CBC)",
            category="LAB",
            status="COMPLETED",
            notes="Evaluate for anemia or signs of infection based on reported fatigue."
        )
        DiagnosticResult.objects.create(
            order=order1,
            performed_by=labtech,
            result_summary="Hemoglobin slightly low, WBC normal",
            report_text="Hb: 11.5 g/dL (Low), RBC: 4.1M/uL, WBC: 6.2K/uL, Platelets: 250K/uL. Mild microcytic anemia.",
            attachment_url="/reports/cbc_alice.pdf"
        )

        # 2. Pending Lab Order for Fiona Gallagher, ordered by Dr. Gregory House, linked to appt 5
        DiagnosticOrder.objects.create(
            patient=patients[4],
            doctor=doctors[2],
            appointment=appointments[5],
            test_name="Lipid Profile",
            category="LAB",
            status="PENDING",
            notes="Routine fasting lipid panel to evaluate cholesterol levels."
        )

        # 3. Completed Radiology Order for Diana Prince, ordered by Dr. Gregory House, linked to appt 2
        order2 = DiagnosticOrder.objects.create(
            patient=patients[2],
            doctor=doctors[2],
            appointment=appointments[2],
            test_name="Chest X-Ray PA View",
            category="RADIOLOGY",
            status="COMPLETED",
            notes="Evaluate for pulmonary infection / pneumonia."
        )
        DiagnosticResult.objects.create(
            order=order2,
            performed_by=radiologist,
            result_summary="Normal chest radiograph",
            report_text="Both lung fields are clear. No pleural effusion or pneumothorax. Cardiomediastinal silhouette is within normal limits. Normal chest X-Ray.",
            attachment_url="/reports/cxr_diana.jpg"
        )

        DiagnosticOrder.objects.create(
            patient=patients[3],
            doctor=doctors[2],
            appointment=appointments[4],
            test_name="Brain MRI",
            category="RADIOLOGY",
            status="PENDING",
            notes="Assess for structural causes of acute headaches."
        )

        self.stdout.write("Seeded 4 diagnostic orders (2 Completed, 2 Pending).")

    def seed_rosters(self, staff_users, departments):
        self.stdout.write("Seeding duty rosters...")
        
        today = timezone.now()
        rosters = []
        
        # Seed shifts for doctors and nurses for the next few days
        staff_list = [
            (staff_users['doctors'][0].user, departments['CARD']),
            (staff_users['doctors'][1].user, departments['PEDS']),
            (staff_users['doctors'][2].user, departments['EMER']),
            (staff_users['nurse1'], departments['CARD']),
            (staff_users['nurse2'], departments['EMER']),
        ]
        
        for day_offset in range(-2, 5):
            shift_date = today + datetime.timedelta(days=day_offset)
            
            for staff, dept in staff_list:
                # Morning shift: 08:00 to 14:00
                start_time = datetime.datetime.combine(shift_date.date(), datetime.time(8, 0))
                end_time = datetime.datetime.combine(shift_date.date(), datetime.time(14, 0))
                
                # Make timezone aware using UTC (default in settings)
                start_time = timezone.make_aware(start_time, datetime.timezone.utc)
                end_time = timezone.make_aware(end_time, datetime.timezone.utc)
                
                rosters.append(
                    DutyRoster(
                        staff_member=staff,
                        department=dept,
                        shift_start=start_time,
                        shift_end=end_time,
                        notes="Standard morning clinical duty."
                    )
                )
                
                # Night shift on alternate days for some staff
                if (day_offset + ord(staff.full_name[0])) % 2 == 0:
                    start_time_night = datetime.datetime.combine(shift_date.date(), datetime.time(20, 0))
                    end_time_night = datetime.datetime.combine(shift_date.date() + datetime.timedelta(days=1), datetime.time(2, 0))
                    
                    start_time_night = timezone.make_aware(start_time_night, datetime.timezone.utc)
                    end_time_night = timezone.make_aware(end_time_night, datetime.timezone.utc)
                    
                    rosters.append(
                        DutyRoster(
                            staff_member=staff,
                            department=dept,
                            shift_start=start_time_night,
                            shift_end=end_time_night,
                            notes="On-call emergency night shift duty."
                        )
                    )
                    
        DutyRoster.objects.bulk_create(rosters)
        self.stdout.write(f"Seeded {len(rosters)} duty roster shifts.")
